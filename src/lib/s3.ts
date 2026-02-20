import "server-only";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error("AWS credentials environment variables are not set");
}

// @ts-expect-error requestChecksumCalculation is valid at runtime in @aws-sdk/client-s3 v3.621+
// but is missing from TypeScript types; "when_required" disables auto-CRC32 in presigned PUT URLs
export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  requestChecksumCalculation: "when_required",
});

const GALLERY_BUCKET = process.env.AWS_S3_BUCKET!;

/**
 * Generate a presigned PUT URL for direct browser-to-S3 upload.
 * The URL expires in 15 minutes.
 */
export async function generatePresignedUploadUrl(
  s3Key: string,
  contentType: string,
  expiresInSeconds = 900
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: GALLERY_BUCKET,
    Key: s3Key,
    ContentType: contentType,
  });
  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

/**
 * Generate a presigned GET URL for server-side access to a private object.
 * Use CloudFront signed URLs instead for customer-facing delivery.
 */
export async function generatePresignedDownloadUrl(
  s3Key: string,
  filename: string,
  expiresInSeconds = 300
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: GALLERY_BUCKET,
    Key: s3Key,
    ResponseContentDisposition: `attachment; filename="${encodeURIComponent(filename)}"`,
  });
  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

/**
 * Delete a photo from S3.
 */
export async function deleteS3Object(s3Key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: GALLERY_BUCKET,
    Key: s3Key,
  });
  await s3Client.send(command);
}

/**
 * Build the S3 key for a gallery photo.
 * e.g. galleries/abc123/DSC001.jpg
 */
export function buildGalleryPhotoKey(galleryId: string, filename: string): string {
  return `galleries/${galleryId}/${filename}`;
}
