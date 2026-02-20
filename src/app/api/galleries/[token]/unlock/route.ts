import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { galleries, gallerySessions, pinAttempts } from "@/db/schema";
import { eq, and, gt, count } from "drizzle-orm";
import { verifyPin, generateSessionToken, getSessionExpiry } from "@/lib/gallery-auth";

const unlockSchema = z.object({
  pin: z.string().min(4).max(12),
});

interface RouteParams {
  params: Promise<{ token: string }>;
}

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { token } = await params;

  // Validate token format (64 hex chars)
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Extract IP early — needed for rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

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

  // Rate limit: 5 failed attempts per IP per gallery in a 15-minute window
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const result = await db
    .select({ value: count() })
    .from(pinAttempts)
    .where(
      and(
        eq(pinAttempts.galleryToken, token),
        eq(pinAttempts.ipAddress, ip),
        gt(pinAttempts.attemptedAt, windowStart)
      )
    );
  const recentFailures = result[0]?.value ?? 0;
  if (recentFailures >= RATE_LIMIT_MAX) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in 15 minutes." },
      { status: 429 }
    );
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
    // Record this failed attempt for rate limiting
    await db.insert(pinAttempts).values({ galleryToken: token, ipAddress: ip });
    return NextResponse.json(
      { error: "Incorrect PIN. Please try again." },
      { status: 401 }
    );
  }

  // Issue a gallery session token
  const sessionToken = generateSessionToken();
  const expiresAt = getSessionExpiry();

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
    path: "/",
    expires: expiresAt,
  });

  return response;
}
