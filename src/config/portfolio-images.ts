/**
 * Portfolio and slideshow image configuration.
 *
 * To add images:
 * 1. Upload photos to your S3 bucket under the "portfolio/" prefix.
 * 2. Add entries to the arrays below using the CloudFront URL or the s3Key.
 *
 * For the hero slideshow, use large landscape images (ideally 1920x1080+).
 * For the portfolio grid, include aspect ratio for proper layout.
 */

export interface SlideImage {
  src: string;
  alt: string;
}

export interface PortfolioImage {
  src: string;
  alt: string;
  category: "portrait" | "wedding" | "family" | "headshot" | "event" | "other";
  aspectRatio: number; // width / height, e.g. 1.5 for landscape 3:2
}

/**
 * Hero slideshow images — update these with your actual CloudFront URLs.
 * Example: `https://d1234abcd.cloudfront.net/portfolio/hero-1.jpg`
 */
export const heroSlides: SlideImage[] = [
  {
    src: "https://d3ljpz8qm1zyne.cloudfront.net/portfolio/hero-1.jpg",
    alt: "Engagement couple",
  },
  {
    src: "https://d3ljpz8qm1zyne.cloudfront.net/portfolio/hero-2.jpg",
    alt: "Engagement couple",
  },
  {
    src: "https://d3ljpz8qm1zyne.cloudfront.net/portfolio/hero-3.jpg",
    alt: "Prom portrait",
  },
  {
    src: "https://d3ljpz8qm1zyne.cloudfront.net/portfolio/hero-4.jpg",
    alt: "Senior portrait",
  },
  {
    src: "https://d3ljpz8qm1zyne.cloudfront.net/portfolio/hero-5.jpg",
    alt: "Wedding",
  },
  {
    src: "https://d3ljpz8qm1zyne.cloudfront.net/portfolio/hero-6.jpg",
    alt: "Senior portrait",
  },
  {
    src: "https://d3ljpz8qm1zyne.cloudfront.net/portfolio/hero-7.jpg",
    alt: "Prom",
  },
  {
    src: "https://d3ljpz8qm1zyne.cloudfront.net/portfolio/hero-8.jpg",
    alt: "Senior portrait",
  },
  {
    src: "https://d3ljpz8qm1zyne.cloudfront.net/portfolio/hero-9.jpg",
    alt: "Covered bridge",
  },
];


/**
 * Portfolio gallery images.
 */
export const portfolioImages: PortfolioImage[] = [
  {
    src: "https://d3ljpz8qm1zyne.cloudfront.net/portfolio/hero-4.jpg",
    alt: "Prom portrait",
    category: "portrait",
    aspectRatio: 0.75,   // tall portrait (3:4)
  },
  {
    src: "https://d3ljpz8qm1zyne.cloudfront.net/portfolio/hero-5.jpg",
    alt: "Wedding ceremony moment",
    category: "wedding",
    aspectRatio: 1.5,    // wide landscape (3:2)
  },
  {
    src: "https://d3ljpz8qm1zyne.cloudfront.net/portfolio/hero-9.jpg",
    alt: "Covered bridge",
    category: "portrait",
    aspectRatio: 1.33,   // landscape (4:3)
  },
  // keep adding more entries...
];


/**
 * Available session types shown on the booking form.
 */
export const sessionTypes = [
  { value: "portrait", label: "Portrait Session" },
  { value: "family", label: "Family Session" },
  { value: "wedding", label: "Wedding Photography" },
  { value: "headshot", label: "Professional Headshots" },
  { value: "event", label: "Event Photography" },
  { value: "newborn", label: "Newborn Session" },
  { value: "engagement", label: "Engagement Session" },
] as const;

/**
 * Session pricing in cents (used as the default starting price on the booking form).
 * The photographer can override prices per session in the admin panel.
 */
export const sessionPricing: Record<string, number> = {
  portrait: 25000,    // $250
  family: 35000,      // $350
  wedding: 250000,    // $2,500
  headshot: 15000,    // $150
  event: 75000,       // $750
  newborn: 30000,     // $300
  engagement: 20000,  // $200
};
