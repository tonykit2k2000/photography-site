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
