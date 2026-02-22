"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { portfolioCategories } from "@/config/portfolio-categories";
import styles from "./Navbar.module.css";

const navLinks = [
  {
    href: "/portfolio",
    label: "Portfolio",
    submenu: portfolioCategories
      .filter((category) => category.value !== "all")
      .map((category) => ({
        href: `/portfolio/${category.value}`,
        label: category.label,
      })),
  },
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
        <Link
          href="/"
          className={`${styles.logo} ${isTransparent ? styles.logoLight : ""}`}
          aria-label="Tony Kitt Photography — home"
        >
          <span className={styles.logoName}>Tony Kitt</span>
          <span className={styles.logoSub}>Photography</span>
        </Link>
        <ul className={styles.links} role="list">
          {navLinks.map((link) => (
            <li key={link.href} className={styles.navItem}>
              <Link
                href={link.href}
                className={`${styles.link} ${isTransparent ? styles.linkLight : ""}`}
              >
                {link.label}
              </Link>
              {link.submenu && (
                <ul className={styles.dropdown} role="list" aria-label="Portfolio categories">
                  {link.submenu.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className={styles.dropdownLink}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
