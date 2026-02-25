"use client";

import { useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { PortfolioImage } from "@/config/portfolio-images";
import styles from "./PortfolioGrid.module.css";

interface Category {
  readonly value: string;
  readonly label: string;
}

interface PortfolioGridProps {
  images: PortfolioImage[];
  categories: readonly Category[];
  initialCategory?: string;
}

export function PortfolioGrid({
  images,
  categories,
  initialCategory = "all",
}: PortfolioGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const activeCategory = initialCategory;

  const handleCategoryChange = (category: string) => {
    const nextPath = category === "all" ? "/portfolio" : `/portfolio/${category}`;
    if (nextPath === pathname) return;
    router.push(nextPath, { scroll: false });
  };

  const filtered =
    activeCategory === "all"
      ? images
      : images.filter((img) => img.category === activeCategory);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const lightboxPrev = () =>
    setLightboxIndex((i) =>
      i === null ? null : (i - 1 + filtered.length) % filtered.length
    );
  const lightboxNext = () =>
    setLightboxIndex((i) =>
      i === null ? null : (i + 1) % filtered.length
    );

  const currentImage = lightboxIndex !== null ? filtered[lightboxIndex] : null;

  return (
    <>
      {/* Category filter */}
      <nav className={styles.filterBar} aria-label="Filter by category">
        {categories.map((cat) => (
          <button
            key={cat.value}
            className={`${styles.filterBtn} ${activeCategory === cat.value ? styles.filterBtnActive : ""}`}
            onClick={() => handleCategoryChange(cat.value)}
            aria-pressed={activeCategory === cat.value}
          >
            {cat.label}
          </button>
        ))}
      </nav>

      {/* Photo grid */}
      <div className={styles.grid}>
        {filtered.map((image, index) => (
          <button
            key={image.src}
            className={styles.gridItem}
            onClick={() => openLightbox(index)}
            aria-label={`View ${image.alt}`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={800}
              height={Math.round(800 / image.aspectRatio)}
              sizes="(max-width: 480px) 100vw, (max-width: 900px) 50vw, 33vw"
              style={{ width: "100%", height: "auto" }}
              className={styles.gridImage}
            />
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className={styles.emptyState}>
          No photos in this category yet. Check back soon!
        </p>
      )}

      {/* Lightbox */}
      {currentImage && (
        <dialog
          className={styles.lightbox}
          open
          onClick={closeLightbox}
          aria-modal="true"
          aria-label="Photo viewer"
        >
          <div
            className={styles.lightboxContent}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentImage.src}
              alt={currentImage.alt}
              fill
              sizes="100vw"
              style={{ objectFit: "contain" }}
              priority
            />
            <button
              type="button"
              className={styles.lightboxClose}
              onClick={closeLightbox}
              aria-label="Close"
            >
              &times;
            </button>
            <button
              type="button"
              className={`${styles.lightboxArrow} ${styles.lightboxArrowLeft}`}
              onClick={lightboxPrev}
              aria-label="Previous photo"
            >
              &#8249;
            </button>
            <button
              type="button"
              className={`${styles.lightboxArrow} ${styles.lightboxArrowRight}`}
              onClick={lightboxNext}
              aria-label="Next photo"
            >
              &#8250;
            </button>
          </div>
        </dialog>
      )}
    </>
  );
}
