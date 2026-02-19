"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import styles from "./HeroSlideshow.module.css";

interface Slide {
  src: string;
  alt: string;
}

interface HeroSlideshowProps {
  slides: Slide[];
  intervalMs?: number;
}

export function HeroSlideshow({
  slides,
  intervalMs = 5000,
}: HeroSlideshowProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(next, intervalMs);
    return () => clearInterval(timer);
  }, [isPaused, next, intervalMs, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section
      className={styles.slideshow}
      aria-label="Featured photography"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.src}
          className={`${styles.slide} ${index === current ? styles.active : ""}`}
          aria-hidden={index !== current}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={index === 0}
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
        </div>
      ))}

      <div className={styles.overlay}>
        <h1 className={styles.headline}>Capturing Life&apos;s Moments</h1>
        <p className={styles.tagline}>
          Professional photography for portraits, weddings, and milestones
        </p>
        <a href="/schedule" className={styles.cta}>
          Book a Session
        </a>
      </div>

      {slides.length > 1 && (
        <>
          <button
            className={`${styles.arrow} ${styles.arrowLeft}`}
            onClick={prev}
            aria-label="Previous photo"
          >
            &#8249;
          </button>
          <button
            className={`${styles.arrow} ${styles.arrowRight}`}
            onClick={next}
            aria-label="Next photo"
          >
            &#8250;
          </button>

          <div className={styles.dots} role="tablist" aria-label="Slide indicators">
            {slides.map((_, index) => (
              <button
                key={index}
                role="tab"
                aria-selected={index === current}
                aria-label={`Go to slide ${index + 1}`}
                className={`${styles.dot} ${index === current ? styles.dotActive : ""}`}
                onClick={() => setCurrent(index)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
