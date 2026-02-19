import type { Metadata } from "next";
import { BookingForm } from "@/components/scheduling/BookingForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Book a Session",
  description:
    "Schedule your photography session. Portrait, family, wedding, and headshot sessions available.",
};

export default function SchedulePage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <h1 className={styles.heading}>Book a Session</h1>
          <p className={styles.subheading}>
            Fill out the form below and I&apos;ll get back to you within 24
            hours to confirm your session details.
          </p>
        </header>

        <div className={styles.formWrapper}>
          <BookingForm />
        </div>

        <aside className={styles.info}>
          <h2 className={styles.infoHeading}>What to Expect</h2>
          <ul className={styles.infoList}>
            <li>
              A <strong>booking deposit</strong> may be required to hold your
              date.
            </li>
            <li>
              Full payment is due before or on the day of your session.
            </li>
            <li>
              After full payment, you&apos;ll receive a private link to view and
              download your photos.
            </li>
            <li>
              Cancellations with more than 48 hours notice receive a full
              refund.
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
