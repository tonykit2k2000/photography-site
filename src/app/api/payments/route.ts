import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";

const paymentSchema = z.object({
  sessionId: z.string().uuid(),
  amountCents: z.number().int().min(100), // Minimum $1.00
  paymentType: z.enum(["deposit", "partial", "final", "full"]),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = paymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 422 }
    );
  }

  const { sessionId, amountCents, paymentType } = parsed.data;

  // Load the session to validate it exists
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
    with: { customer: true },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (session.status === "cancelled") {
    return NextResponse.json(
      { error: "This session has been cancelled" },
      { status: 400 }
    );
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      metadata: {
        sessionId,
        paymentType,
        customerEmail: session.customer?.email ?? "",
      },
      receipt_email: session.customer?.email ?? undefined,
      description: `${session.title} — ${paymentType} payment`,
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe PaymentIntent creation failed:", error);
    return NextResponse.json(
      { error: "Payment initialization failed. Please try again." },
      { status: 500 }
    );
  }
}
