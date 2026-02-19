import type { Metadata } from "next";
import { db } from "@/db";
import { galleries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PinEntry } from "@/components/gallery/PinEntry";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "View Your Photos",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ token: string }>;
}

export default async function GalleryUnlockPage({ params }: Props) {
  const { token } = await params;

  if (!/^[a-f0-9]{64}$/.test(token)) notFound();

  // Verify the gallery exists and is active
  const gallery = await db.query.galleries.findFirst({
    where: eq(galleries.accessToken, token),
  });

  if (!gallery || !gallery.isActive) notFound();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon} aria-hidden="true">
          🔒
        </div>
        <h1 className={styles.title}>Your Photo Gallery</h1>
        <p className={styles.subtitle}>
          Enter the PIN from your gallery notification email to view your photos.
        </p>
        <PinEntry token={token} />
      </div>
    </div>
  );
}
