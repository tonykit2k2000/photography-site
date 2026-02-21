import Link from "next/link";
import styles from "./Navbar.module.css";

const navLinks = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/schedule", label: "Book a Session" },
];

export function Navbar() {
  return (
    <header className={styles.header}>
      <nav className={`${styles.nav} container`} aria-label="Main navigation">
        <Link href="/" className={styles.logo}>
          <img src="/logo.png" alt="Tony Kitt Photography" className={styles.logoImg} />
        </Link>
        <ul className={styles.links} role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={styles.link}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
