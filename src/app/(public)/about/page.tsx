import type { Metadata } from "next";
import Image from "next/image";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Tony Kitt — professional photographer capturing portraits, weddings, families, and milestones in Central Illinois.",
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <div className={`${styles.inner} container`}>
        <div className={styles.photoColumn}>
          {/* TODO: replace src with your actual headshot image path or CloudFront URL */}
          <div className={styles.photoPlaceholder}>
            <Image
              src="/headshot-placeholder.jpg"
              alt="Tony Kitt, photographer"
              fill
              style={{ objectFit: "cover", borderRadius: "inherit" }}
              sizes="(max-width: 768px) 320px, 400px"
            />
          </div>
        </div>

        <div className={styles.textColumn}>
          <h1 className={styles.heading}>About Me</h1>
          <p className={styles.intro}>
            Hi, I&apos;m Tony Kitt — a professional photographer with a
            passion for capturing authentic moments and telling stories through
            imagery.
          </p>

          <div className={styles.body}>
            <p>
              Based in Central Illinois, I specialize in portrait, family, and
              wedding photography. With over 10+ years of experience, I believe
              every person and every moment is unique — and my job is to make
              sure you&apos;ll be able to relive yours forever.
            </p>
            <p>
              My style blends natural light with candid moments and thoughtful
              composition. I want you to feel comfortable and be yourself in
              front of my camera, so we always start every session with a
              conversation.
            </p>
            <p>
              {/* TODO: personalize this sentence with your own interests */}
              When I&apos;m not behind the lens, you can find me exploring new
              locations and enjoying the outdoors. That sense of joy and
              authenticity is what I bring to every shoot.
            </p>
          </div>

          <div className={styles.callout}>
            <h2 className={styles.calloutHeading}>Ready to work together?</h2>
            <a href="/schedule" className={styles.cta}>
              Book a Session
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
