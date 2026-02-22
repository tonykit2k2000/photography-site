import type { Metadata } from "next";
import { portfolioImages } from "@/config/portfolio-images";
import { portfolioCategories } from "@/config/portfolio-categories";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Browse my photography portfolio — portraits, weddings, families, and more.",
};

interface PortfolioPageProps {
  searchParams?: {
    category?: string;
  };
}

export default function PortfolioPage({ searchParams }: PortfolioPageProps) {
  const categoryParam = searchParams?.category ?? "all";
  const initialCategory = portfolioCategories.some(
    (category) => category.value === categoryParam
  )
    ? categoryParam
    : "all";

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <h1 className={styles.heading}>Portfolio</h1>
          <p className={styles.subheading}>
            A selection of my favorite work across sessions and events.
          </p>
        </header>
        <PortfolioGrid
          images={portfolioImages}
          categories={portfolioCategories}
          initialCategory={initialCategory}
        />
      </div>
    </div>
  );
}
