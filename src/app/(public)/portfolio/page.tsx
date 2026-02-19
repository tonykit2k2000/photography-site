import type { Metadata } from "next";
import { portfolioImages } from "@/config/portfolio-images";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Browse my photography portfolio — portraits, weddings, families, and more.",
};

const categories = [
  { value: "all", label: "All" },
  { value: "portrait", label: "Portraits" },
  { value: "wedding", label: "Weddings" },
  { value: "family", label: "Families" },
  { value: "headshot", label: "Headshots" },
  { value: "event", label: "Events" },
] as const;

export default function PortfolioPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <h1 className={styles.heading}>Portfolio</h1>
          <p className={styles.subheading}>
            A selection of my favorite work across sessions and events.
          </p>
        </header>
        <PortfolioGrid images={portfolioImages} categories={categories} />
      </div>
    </div>
  );
}
