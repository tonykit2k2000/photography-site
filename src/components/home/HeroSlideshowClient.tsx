"use client";

import dynamic from "next/dynamic";
import type { SlideImage } from "@/config/portfolio-images";
import styles from "./HeroSlideshowClient.module.css";

function HeroFallback() {
  return (
    <div className={styles.heroFallback}>
      <p className={styles.eyebrow}>Professional Photography</p>
      <div className={styles.divider} />
      <h1 className={styles.headline}>Capturing Life&apos;s Moments</h1>
      <p className={styles.tagline}>
        Professional photography for portraits, weddings, and milestones
      </p>
      <div className={styles.ctas}>
        <a href="/schedule" className={styles.ctaPrimary}>
          Book a Session
        </a>
        <a href="/portfolio" className={styles.ctaSecondary}>
          View Portfolio
        </a>
      </div>
    </div>
  );
}

const HeroSlideshowDynamic = dynamic(
  () => import("./HeroSlideshow").then((m) => m.HeroSlideshow),
  {
    ssr: false,
    loading: () => <HeroFallback />,
  }
);

interface Props {
  slides: SlideImage[];
}

export function HeroSlideshowClient({ slides }: Props) {
  return <HeroSlideshowDynamic slides={slides} />;
}
