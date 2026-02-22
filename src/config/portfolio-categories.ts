export interface PortfolioCategory {
  readonly value: string;
  readonly label: string;
}

export const portfolioCategories: readonly PortfolioCategory[] = [
  { value: "all", label: "All" },
  { value: "portrait", label: "Portraits" },
  { value: "wedding", label: "Weddings" },
  { value: "family", label: "Families" },
  { value: "headshot", label: "Headshots" },
  { value: "event", label: "Events" },
  { value: "landscape", label: "Landscapes" },
] as const;
