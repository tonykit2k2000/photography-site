import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { galleries, galleryPhotos, gallerySessions } from "@/db/schema";
import { eq, and, gt, isNotNull } from "drizzle-orm";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3";
import archiver from "archiver";

interface RouteParams {
  params: Promise<{ token: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse | Response> {
  const { token } = await params;

  if (!/^[a-f0-9]{64}$/.test(token)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const gallery = await db.query.galleries.findFirst({
    where: eq(galleries.accessToken, token),
  });

  if (!gallery || !gallery.isActive) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Verify session cookie
  const sessionCookieValue = request.cookies.get(
    `gallery_session_${token}`
  )?.value;

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

  // Load confirmed photos only
  const photos = await db.query.galleryPhotos.findMany({
    where: and(
      eq(galleryPhotos.galleryId, gallery.id),
      isNotNull(galleryPhotos.uploadedAt)
    ),
    orderBy: (galleryPhotos, { asc }) => [asc(galleryPhotos.sortOrder)],
    limit: gallery.photoLimit,
  });

  if (photos.length === 0) {
    return NextResponse.json({ error: "No photos found" }, { status: 404 });
  }

  // Fetch all photos from S3 and build ZIP
  const archive = archiver("zip", { zlib: { level: 5 } });

  for (const photo of photos) {
    const command = new GetObjectCommand({
      Bucket: photo.s3Bucket,
      Key: photo.s3Key,
    });
    const s3Response = await s3Client.send(command);
    if (s3Response.Body) {
      // transformToByteArray() works reliably in both Node.js and Edge runtimes
      const bytes = await s3Response.Body.transformToByteArray();
      archive.append(Buffer.from(bytes), { name: photo.filename });
    }
  }

  archive.finalize();

  // Buffer the completed archive
  const chunks: Uint8Array[] = [];
  for await (const chunk of archive) {
    chunks.push(chunk as Uint8Array);
  }
  const buffer = Buffer.concat(chunks);

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="photos.zip"',
      "Content-Length": String(buffer.length),
    },
  });
}
