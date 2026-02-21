import Link from "next/link";
import styles from "./Footer.module.css";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={`${styles.inner} container`}>
        <p className={styles.copy}>
          &copy; {year} Tony Kitt Photography. All rights reserved.
        </p>

        {/* TODO: update each href with your actual social media profile URLs */}
        <div className={styles.socials}>
          <a
            href="https://www.instagram.com/TODO"
            className={styles.socialLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow on Instagram"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
            </svg>
          </a>
          <a
            href="https://www.facebook.com/TODO"
            className={styles.socialLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow on Facebook"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/TODO"
            className={styles.socialLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Connect on LinkedIn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
        </div>

        <nav aria-label="Footer navigation">
          <ul className={styles.links} role="list">
            <li>
              <Link href="/portfolio" className={styles.link}>
                Portfolio
              </Link>
            </li>
            <li>
              <Link href="/about" className={styles.link}>
                About
              </Link>
            </li>
            <li>
              <Link href="/blog" className={styles.link}>
                Blog
              </Link>
            </li>
            <li>
              <Link href="/schedule" className={styles.link}>
                Book a Session
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
