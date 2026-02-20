"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./GalleryGrid.module.css";

interface GalleryPhoto {
  id: string;
  filename: string;
  signedUrl: string;
  width: number | null;
  height: number | null;
}

interface GalleryGridProps {
  photos: GalleryPhoto[];
  galleryToken: string;
}

export function GalleryGrid({ photos, galleryToken }: GalleryGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const lightboxPrev = () =>
    setLightboxIndex((i) =>
      i === null ? null : (i - 1 + photos.length) % photos.length
    );
  const lightboxNext = () =>
    setLightboxIndex((i) => (i === null ? null : (i + 1) % photos.length));

  const currentPhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

  async function handleDownload(photoId: string, filename: string) {
    setDownloading(photoId);
    try {
      const res = await fetch(
        `/api/galleries/photos/${photoId}?download=true`
      );
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Download failed. Please try again.");
    } finally {
      setDownloading(null);
    }
  }

  async function handleDownloadAll() {
    setDownloading("all");
    try {
      const res = await fetch(
        `/api/galleries/${galleryToken}/download-all`
      );
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "photos.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Download failed. Please try again.");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <>
      <div className={styles.toolbar}>
        <button
          className={styles.downloadAllBtn}
          onClick={handleDownloadAll}
          disabled={downloading === "all"}
        >
          {downloading === "all" ? "Preparing ZIP…" : `Download All (${photos.length} photos)`}
        </button>
      </div>

      <div className={styles.grid}>
        {photos.map((photo, index) => (
          <div key={photo.id} className={styles.tile}>
            <button
              className={styles.tileButton}
              onClick={() => openLightbox(index)}
              aria-label={`View ${photo.filename}`}
            >
              <Image
                src={photo.signedUrl}
                alt={photo.filename}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                style={{ objectFit: "cover" }}
                className={styles.tileImage}
                unoptimized // Signed CloudFront URLs — skip Next.js image optimization
              />
            </button>
            <button
              className={styles.downloadBtn}
              onClick={() => handleDownload(photo.id, photo.filename)}
              disabled={downloading === photo.id}
              aria-label={`Download ${photo.filename}`}
              title="Download this photo"
            >
              {downloading === photo.id ? "…" : "↓"}
            </button>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {currentPhoto && (
        <dialog
          className={styles.lightbox}
          open
          aria-modal="true"
          aria-label="Photo viewer"
        >
          <div
            className={styles.lightboxBackdrop}
            onClick={closeLightbox}
          />
          <div className={styles.lightboxContent}>
            <Image
              src={currentPhoto.signedUrl}
              alt={currentPhoto.filename}
              fill
              style={{ objectFit: "contain" }}
              priority
              unoptimized
            />

            <button
              className={styles.lightboxClose}
              onClick={closeLightbox}
              aria-label="Close"
            >
              &times;
            </button>
            <button
              className={`${styles.lightboxArrow} ${styles.lightboxArrowLeft}`}
              onClick={lightboxPrev}
              aria-label="Previous photo"
            >
              &#8249;
            </button>
            <button
              className={`${styles.lightboxArrow} ${styles.lightboxArrowRight}`}
              onClick={lightboxNext}
              aria-label="Next photo"
            >
              &#8250;
            </button>
            <button
              className={styles.lightboxDownload}
              onClick={() =>
                handleDownload(currentPhoto.id, currentPhoto.filename)
              }
              disabled={downloading === currentPhoto.id}
            >
              {downloading === currentPhoto.id
                ? "Preparing…"
                : "Download"}
            </button>
          </div>
        </dialog>
      )}
    </>
  );
}
