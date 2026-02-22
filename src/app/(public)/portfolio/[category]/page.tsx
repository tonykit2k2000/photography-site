import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { portfolioImages } from "@/config/portfolio-images";
import { portfolioCategories } from "@/config/portfolio-categories";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import styles from "../page.module.css";

interface PortfolioCategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateMetadata({
  params,
}: PortfolioCategoryPageProps): Promise<Metadata> {
  const { category: categoryParam } = await params;
  const category = portfolioCategories.find((item) => item.value === categoryParam);

  if (!category || category.value === "all") {
    return {
      title: "Portfolio",
    };
  }

  return {
    title: `${category.label} Portfolio`,
    description: `Browse ${category.label.toLowerCase()} photography sessions.`,
  };
}

export default async function PortfolioCategoryPage({
  params,
}: PortfolioCategoryPageProps) {
  const { category: categoryParam } = await params;
  const category = portfolioCategories.find((item) => item.value === categoryParam);

  if (!category || category.value === "all") {
    notFound();
  }

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
          initialCategory={category.value}
        />
      </div>
    </div>
  );
}
