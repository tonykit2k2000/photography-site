import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { galleryPhotos } from "@/db/schema";
import { generatePresignedUploadUrl, buildGalleryPhotoKey } from "@/lib/s3";

const uploadSchema = z.object({
  galleryId: z.string().uuid(),
  filename: z.string().min(1).max(255),
  contentType: z.string().refine(
    (ct) => ct.startsWith("image/"),
    "Only image files are allowed"
  ),
  fileSizeBytes: z.number().int().min(1).max(100 * 1024 * 1024), // max 100MB
});

const GALLERY_BUCKET = process.env.AWS_S3_BUCKET!;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = uploadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 422 }
    );
  }

  const { galleryId, filename, contentType, fileSizeBytes } = parsed.data;

  // Sanitize filename
  const safeName = filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const s3Key = buildGalleryPhotoKey(galleryId, `${Date.now()}_${safeName}`);

  // Create a pending photo record
  const [photo] = await db
    .insert(galleryPhotos)
    .values({
      galleryId,
      s3Key,
      s3Bucket: GALLERY_BUCKET,
      filename: safeName,
      fileSizeBytes,
      sortOrder: Math.floor(Date.now() / 1000), // Unix seconds fits in integer
    })
    .returning();

  if (!photo) {
    return NextResponse.json(
      { error: "Failed to create photo record" },
      { status: 500 }
    );
  }

  // Generate presigned PUT URL (15 minute expiry)
  const uploadUrl = await generatePresignedUploadUrl(s3Key, contentType);

  return NextResponse.json({ uploadUrl, s3Key, photoId: photo.id });
}
