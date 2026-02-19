import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { galleries, gallerySessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPin, generateSessionToken, getSessionExpiry } from "@/lib/gallery-auth";

const unlockSchema = z.object({
  pin: z.string().min(4).max(12),
});

interface RouteParams {
  params: Promise<{ token: string }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { token } = await params;

  // Validate token format (64 hex chars)
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = unlockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid PIN format" }, { status: 422 });
  }

  // Look up the gallery
  const gallery = await db.query.galleries.findFirst({
    where: eq(galleries.accessToken, token),
  });

  // Return 404 for both non-existent and inactive galleries
  // to avoid revealing whether a gallery exists
  if (!gallery || !gallery.isActive) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Verify PIN (bcrypt compare)
  const isValid = await verifyPin(parsed.data.pin, gallery.passwordHash);
  if (!isValid) {
    return NextResponse.json(
      { error: "Incorrect PIN. Please try again." },
      { status: 401 }
    );
  }

  // Issue a gallery session token
  const sessionToken = generateSessionToken();
  const expiresAt = getSessionExpiry();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  await db.insert(gallerySessions).values({
    galleryId: gallery.id,
    sessionToken,
    ipAddress: ip,
    userAgent: request.headers.get("user-agent"),
    expiresAt,
  });

  // Set httpOnly cookie
  const cookieName = `gallery_session_${token}`;
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: cookieName,
    value: sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/gallery/${token}`,
    expires: expiresAt,
  });

  return response;
}
