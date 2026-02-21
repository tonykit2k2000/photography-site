"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./Navbar.module.css";

const navLinks = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/schedule", label: "Book a Session" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  const isHome = pathname === "/";
  const isTransparent = isHome && !scrolled;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header className={`${styles.header} ${isTransparent ? styles.transparent : ""}`}>
      <nav className={`${styles.nav} container`} aria-label="Main navigation">
        <Link href="/" className={styles.logo}>
          <img
            src="/logo.png"
            alt="Tony Kitt Photography"
            className={`${styles.logoImg} ${isTransparent ? styles.logoImgLight : ""}`}
          />
        </Link>
        <ul className={styles.links} role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`${styles.link} ${isTransparent ? styles.linkLight : ""}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
