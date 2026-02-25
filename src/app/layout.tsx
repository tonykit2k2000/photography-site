import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Tony Kitt Photography",
    template: "%s | Tony Kitt Photography",
  },
  description:
    "Professional photography by Tony Kitt — portraits, weddings, families, headshots, and more.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Tony Kitt Photography",
    url: "https://www.tonykittphotography.com",
    images: [
      {
        url: "https://d3ljpz8qm1zyne.cloudfront.net/portfolio/hero-1.jpg",
        width: 1200,
        height: 800,
        alt: "Tony Kitt Photography",
      },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Tony Kitt Photography",
  description:
    "Professional photography for portraits, weddings, families, headshots, and milestones in Central Illinois.",
  url: "https://www.tonykittphotography.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Central Illinois",
    addressRegion: "IL",
    addressCountry: "US",
  },
  priceRange: "$$",
  sameAs: [
    "https://www.instagram.com/kittivanichkulkraitony",
    "https://www.facebook.com/tony.kitt.3",
    "https://www.linkedin.com/in/tony-kittivanichkulkrai-7a63882b4",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
