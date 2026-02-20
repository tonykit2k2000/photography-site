import { notFound } from "next/navigation";
import { db } from "@/db";
import { sessions, payments as paymentsTable, galleryPhotos } from "@/db/schema";
import { eq, isNotNull } from "drizzle-orm";
import Link from "next/link";
import { GalleryManager } from "@/components/admin/GalleryManager";
import styles from "./page.module.css";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Session Detail — Admin" };

export default async function SessionDetailPage({ params }: Props) {
  const { id } = await params;

  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, id),
    with: {
      customer: true,
      payments: {
        orderBy: (p, { asc }) => [asc(p.createdAt)],
      },
      gallery: {
        with: {
          photos: {
            where: isNotNull(galleryPhotos.uploadedAt),
          },
        },
      },
    },
  });

  if (!session) notFound();

  const totalPaid = session.payments
    .filter((p) => p.status === "succeeded")
    .reduce((sum, p) => sum + p.amountCents, 0);
  const remaining = session.totalPriceCents - totalPaid;
  const isPaidInFull = remaining <= 0;

  const fmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href="/admin/sessions" className={styles.breadcrumbLink}>
          Sessions
        </Link>{" "}
        / {session.title}
      </div>

      <div className={styles.grid}>
        {/* Left column */}
        <div className={styles.leftCol}>
          {/* Session Info */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Session Details</h2>
            <dl className={styles.details}>
              <dt>Customer</dt>
              <dd>
                {session.customer?.firstName} {session.customer?.lastName}
              </dd>
              <dt>Email</dt>
              <dd>{session.customer?.email}</dd>
              <dt>Phone</dt>
              <dd>{session.customer?.phone}</dd>
              <dt>Session Type</dt>
              <dd className={styles.capitalize}>{session.sessionType}</dd>
              <dt>Date & Time</dt>
              <dd>
                {session.scheduledAt
                  ? new Date(session.scheduledAt).toLocaleString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : "—"}
              </dd>
              <dt>Location</dt>
              <dd>{session.location ?? "Not specified"}</dd>
              <dt>Status</dt>
              <dd>
                <span
                  className={`${styles.badge} ${styles[`badge_${session.status}`]}`}
                >
                  {session.status}
                </span>
              </dd>
              <dt>Notes</dt>
              <dd>{session.notes ?? "None"}</dd>
            </dl>
          </section>

          {/* Payment Summary */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Payments</h2>
            <div className={styles.paymentSummary}>
              <div className={styles.paymentRow}>
                <span>Total Price</span>
                <strong>{fmt.format(session.totalPriceCents / 100)}</strong>
              </div>
              <div className={styles.paymentRow}>
                <span>Paid</span>
                <strong className={styles.green}>
                  {fmt.format(totalPaid / 100)}
                </strong>
              </div>
              <div className={`${styles.paymentRow} ${styles.paymentRowTotal}`}>
                <span>Remaining</span>
                <strong className={remaining > 0 ? styles.red : styles.green}>
                  {fmt.format(Math.max(0, remaining) / 100)}
                </strong>
              </div>
            </div>

            {isPaidInFull && (
              <p className={styles.paidBadge}>✓ Paid in Full</p>
            )}

            {session.payments.length > 0 && (
              <table className={styles.paymentTable}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {session.payments.map((p) => (
                    <tr key={p.id}>
                      <td>{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "—"}</td>
                      <td>{fmt.format(p.amountCents / 100)}</td>
                      <td className={styles.capitalize}>{p.paymentType}</td>
                      <td>
                        <span className={`${styles.badge} ${styles[`payBadge_${p.status}`]}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>

        {/* Right column — Gallery management */}
        <div className={styles.rightCol}>
          {session.gallery ? (
            <GalleryManager
              gallery={session.gallery}
              photos={session.gallery.photos}
              sessionId={session.id}
            />
          ) : (
            <section className={styles.card}>
              <p className={styles.noGallery}>
                Gallery will be created automatically when the session is booked.
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
