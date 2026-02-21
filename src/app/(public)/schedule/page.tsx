import type { Metadata } from "next";
import { BookingForm } from "@/components/scheduling/BookingForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Book a Session",
  description:
    "Schedule your photography session. Portrait, family, wedding, and headshot sessions available.",
};

// TODO: set to true when you're ready to open booking
const BOOKING_ENABLED = false;

export default function SchedulePage() {
  if (!BOOKING_ENABLED) {
    return (
      <div className={styles.comingSoonPage}>
        <div className="container">
          <div className={styles.comingSoonInner}>
            <div className={styles.comingSoonIcon} aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.25}
                stroke="currentColor"
                width={48}
                height={48}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                />
              </svg>
            </div>
            <h1 className={styles.comingSoonHeading}>Booking Coming Soon</h1>
            <p className={styles.comingSoonText}>
              Online booking is not yet available, but sessions are filling up
              fast. Reach out directly to reserve your date.
            </p>
            <a href="/" className={styles.comingSoonBtn}>
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Original booking page — set BOOKING_ENABLED = true above to restore
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
