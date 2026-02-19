import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { galleries, gallerySessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPin } from "@/lib/gallery-auth";

const pinSchema = z.object({
  pin: z.string().regex(/^\d{4,8}$/, "PIN must be 4–8 digits"),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = pinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid PIN" },
      { status: 422 }
    );
  }

  const gallery = await db.query.galleries.findFirst({
    where: eq(galleries.id, id),
  });
  if (!gallery) {
    return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
  }

  const passwordHash = await hashPin(parsed.data.pin);

  // Update PIN and invalidate all existing gallery sessions (security measure)
  await db.update(galleries).set({ passwordHash }).where(eq(galleries.id, id));
  await db.delete(gallerySessions).where(eq(gallerySessions.galleryId, id));

  return NextResponse.json({ success: true });
}
