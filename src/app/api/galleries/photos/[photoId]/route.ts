import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { galleryPhotos, galleries, gallerySessions } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { generateSignedDownloadUrl, generateSignedPhotoUrl } from "@/lib/cloudfront";

interface RouteParams {
  params: Promise<{ photoId: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { photoId } = await params;
  const isDownload = request.nextUrl.searchParams.get("download") === "true";

  // Load the photo and its gallery
  const photo = await db.query.galleryPhotos.findFirst({
    where: eq(galleryPhotos.id, photoId),
    with: { gallery: true },
  });

  if (!photo || !photo.gallery) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const gallery = photo.gallery;

  // Verify the gallery session cookie
  const cookieName = `gallery_session_${gallery.accessToken}`;
  const sessionCookieValue = request.cookies.get(cookieName)?.value;

  if (!sessionCookieValue) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gallerySession = await db.query.gallerySessions.findFirst({
    where: and(
      eq(gallerySessions.sessionToken, sessionCookieValue),
      eq(gallerySessions.galleryId, gallery.id),
      gt(gallerySessions.expiresAt, new Date())
    ),
  });

  if (!gallerySession) {
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }

  // Generate the appropriate signed URL
  const signedUrl = isDownload
    ? generateSignedDownloadUrl(photo.s3Key, photo.filename)
    : generateSignedPhotoUrl(photo.s3Key);

  return NextResponse.json({ url: signedUrl });
}
