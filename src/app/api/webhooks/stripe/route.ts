import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/db";
import { payments, sessions, galleries } from "@/db/schema";
import { eq, sum } from "drizzle-orm";
import { constructWebhookEvent } from "@/lib/stripe";
import { sendPaymentReceipt, sendGalleryReady } from "@/lib/email";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(payload, signature);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(intent);
        break;
      }
      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(intent);
        break;
      }
      default:
        // Ignore other event types
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(intent: Stripe.PaymentIntent) {
  const sessionId = intent.metadata["sessionId"];
  const paymentType = intent.metadata["paymentType"];

  if (!sessionId || !paymentType) {
    console.warn("PaymentIntent missing metadata:", intent.id);
    return;
  }

  // Idempotency: skip if we already recorded this PaymentIntent
  const existing = await db.query.payments.findFirst({
    where: eq(payments.stripePaymentIntentId, intent.id),
  });
  if (existing?.status === "succeeded") return;

  // Record the payment
  if (existing) {
    await db
      .update(payments)
      .set({ status: "succeeded", paidAt: new Date() })
      .where(eq(payments.stripePaymentIntentId, intent.id));
  } else {
    await db.insert(payments).values({
      sessionId,
      stripePaymentIntentId: intent.id,
      amountCents: intent.amount,
      status: "succeeded",
      paymentType: paymentType as "deposit" | "partial" | "final" | "full",
      paidAt: new Date(),
    });
  }

  // Load the session
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
    with: { customer: true, gallery: true },
  });
  if (!session) return;

  // Calculate total paid so far
  const result = await db
    .select({ total: sum(payments.amountCents) })
    .from(payments)
    .where(eq(payments.sessionId, sessionId));

  const totalPaidCents = Number(result[0]?.total ?? 0);
  const remainingCents = session.totalPriceCents - totalPaidCents;

  // Send payment receipt email
  sendPaymentReceipt({
    customerName: `${session.customer?.firstName ?? ""} ${session.customer?.lastName ?? ""}`.trim(),
    customerEmail: session.customer?.email ?? "",
    amountCents: intent.amount,
    paymentType,
    remainingCents: Math.max(0, remainingCents),
    sessionType: session.sessionType,
    sessionId,
  }).catch((err) => console.error("Payment receipt email failed:", err));

  // Check if fully paid
  if (totalPaidCents >= session.totalPriceCents && session.gallery) {
    const gallery = session.gallery;

    // Activate the gallery
    await db
      .update(galleries)
      .set({ isActive: true })
      .where(eq(galleries.id, gallery.id));

    // Send gallery ready email
    // Note: the PIN shown here is the one the photographer set via admin.
    // We store the hash, not the plain PIN, so we retrieve it from the gallery record.
    // The photographer should set the PIN via admin BEFORE the session is fully paid,
    // or the email will not include a PIN. For now we include the gallery URL.
    const baseUrl = process.env.AUTH_URL ?? "https://yoursite.com";
    const galleryUrl = `${baseUrl}/gallery/${gallery.accessToken}`;

    sendGalleryReady({
      customerName: `${session.customer?.firstName ?? ""} ${session.customer?.lastName ?? ""}`.trim(),
      customerEmail: session.customer?.email ?? "",
      galleryUrl,
      galleryPin: "[See the PIN in your booking confirmation email]",
      photoCount: gallery.photoLimit,
      sessionType: session.sessionType,
    }).catch((err) => console.error("Gallery ready email failed:", err));
  }
}

async function handlePaymentFailed(intent: Stripe.PaymentIntent) {
  const sessionId = intent.metadata["sessionId"];
  if (!sessionId) return;

  // Update payment record if it exists
  const existing = await db.query.payments.findFirst({
    where: eq(payments.stripePaymentIntentId, intent.id),
  });
  if (existing) {
    await db
      .update(payments)
      .set({ status: "failed" })
      .where(eq(payments.stripePaymentIntentId, intent.id));
  } else {
    await db.insert(payments).values({
      sessionId,
      stripePaymentIntentId: intent.id,
      amountCents: intent.amount,
      status: "failed",
      paymentType: (intent.metadata["paymentType"] as "deposit" | "partial" | "final" | "full") ?? "deposit",
    });
  }
}
