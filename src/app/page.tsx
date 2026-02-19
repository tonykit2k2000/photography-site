import { HeroSlideshow } from "@/components/home/HeroSlideshow";
import { heroSlides } from "@/config/portfolio-images";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <>
      <HeroSlideshow slides={heroSlides} />

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

const services = [
  {
    icon: "🎭",
    title: "Portrait Sessions",
    description:
      "Individual and couple portraits that capture personality and emotion.",
  },
  {
    icon: "💍",
    title: "Wedding Photography",
    description:
      "Full-day coverage of your most important day, from preparation to reception.",
  },
  {
    icon: "👨‍👩‍👧‍👦",
    title: "Family Sessions",
    description:
      "Relaxed, candid family sessions that become cherished heirlooms.",
  },
  {
    icon: "💼",
    title: "Professional Headshots",
    description:
      "Polished headshots for LinkedIn, websites, and professional profiles.",
  },
];
