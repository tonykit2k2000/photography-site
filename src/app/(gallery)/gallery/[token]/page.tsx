import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/db";
import { galleries, galleryPhotos, gallerySessions } from "@/db/schema";
import { eq, and, gt, isNotNull } from "drizzle-orm";
import { generateSignedPhotoUrl } from "@/lib/cloudfront";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import styles from "./page.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Photos",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ token: string }>;
}

export default async function GalleryPage({ params }: Props) {
  const { token } = await params;

  if (!/^[a-f0-9]{64}$/.test(token)) notFound();

  const gallery = await db.query.galleries.findFirst({
    where: eq(galleries.accessToken, token),
  });

  if (!gallery || !gallery.isActive) notFound();

  // Validate gallery session cookie
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(`gallery_session_${token}`)?.value;

  if (!sessionToken) {
    notFound(); // Middleware should have redirected, but guard here too
  }

  const gallerySession = await db.query.gallerySessions.findFirst({
    where: and(
      eq(gallerySessions.sessionToken, sessionToken),
      eq(gallerySessions.galleryId, gallery.id),
      gt(gallerySessions.expiresAt, new Date())
    ),
  });

  if (!gallerySession) notFound();

  // Load photos
  const photos = await db.query.galleryPhotos.findMany({
    where: and(
      eq(galleryPhotos.galleryId, gallery.id),
      isNotNull(galleryPhotos.uploadedAt)
    ),
    orderBy: (galleryPhotos, { asc }) => [asc(galleryPhotos.sortOrder)],
    limit: gallery.photoLimit,
  });

  // Generate signed URLs server-side (private key never leaves server)
  const signedPhotos = photos.map((photo) => ({
    id: photo.id,
    filename: photo.filename,
    signedUrl: generateSignedPhotoUrl(photo.s3Key),
    width: photo.width,
    height: photo.height,
  }));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Your Photos</h1>
        <p className={styles.subtitle}>
          {signedPhotos.length} photo{signedPhotos.length !== 1 ? "s" : ""}{" "}
          available &mdash; click any photo to view full size and download.
        </p>
      </header>

      {signedPhotos.length === 0 ? (
        <p className={styles.empty}>
          Your photos are being prepared and will appear here soon.
        </p>
      ) : (
        <GalleryGrid photos={signedPhotos} galleryToken={token} />
      )}
    </div>
  );
}
