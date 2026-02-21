import type { ReactNode } from "react";
import { HeroSlideshow } from "@/components/home/HeroSlideshow";
import { heroSlides } from "@/config/portfolio-images";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <>
      <div className={styles.heroWrapper}>
        <HeroSlideshow slides={heroSlides} />
      </div>

      <section className={styles.intro}>
        <div className="container">
          <h2 className={styles.introHeading}>
            Every moment deserves to be remembered.
          </h2>
          <p className={styles.introText}>
            Professional photography by Tony Kitt — portraits, weddings,
            families, and milestones captured beautifully.
          </p>
          <div className={styles.introLinks}>
            <a href="/portfolio" className={styles.btnOutline}>
              View Portfolio
            </a>
            <a href="/schedule" className={styles.btnPrimary}>
              Book a Session
            </a>
          </div>
        </div>
      </section>

      <section className={styles.services}>
        <div className="container">
          <h2 className={styles.sectionHeading}>What I Offer</h2>
          <div className={styles.serviceGrid}>
            {services.map((service) => (
              <div key={service.title} className={styles.serviceCard}>
                <span className={styles.serviceIcon} aria-hidden="true">
                  {service.icon}
                </span>
                <h3 className={styles.serviceTitle}>{service.title}</h3>
                <p className={styles.serviceDesc}>{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

interface Service {
  icon: ReactNode;
  title: string;
  description: string;
}

const services: Service[] = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={32} height={32}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
    title: "Portrait Sessions",
    description:
      "Individual and couple portraits that capture personality and emotion.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={32} height={32}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
      </svg>
    ),
    title: "Wedding Photography",
    description:
      "Full-day coverage of your most important day, from preparation to reception.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={32} height={32}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
    title: "Family Sessions",
    description:
      "Relaxed, candid family sessions that become cherished heirlooms.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={32} height={32}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
      </svg>
    ),
    title: "Professional Headshots",
    description:
      "Polished headshots for LinkedIn, websites, and professional profiles.",
  },
];
