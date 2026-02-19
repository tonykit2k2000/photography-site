import { db } from "@/db";
import { sessions, payments } from "@/db/schema";
import { eq, desc, gte, sum, count } from "drizzle-orm";
import styles from "./page.module.css";
import Link from "next/link";

export default async function AdminDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [allSessions, pendingSessions, recentPayments] = await Promise.all([
    db.query.sessions.findMany({
      orderBy: desc(sessions.scheduledAt),
      limit: 5,
      with: { customer: true },
    }),
    db.query.sessions.findMany({
      where: eq(sessions.status, "pending"),
      with: { customer: true },
      limit: 10,
    }),
    db.query.payments.findMany({
      where: eq(payments.status, "succeeded"),
      orderBy: desc(payments.paidAt),
      limit: 5,
      with: { session: { with: { customer: true } } },
    }),
  ]);

  const upcomingSessions = allSessions.filter(
    (s) => s.scheduledAt && s.scheduledAt >= today
  );

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Dashboard</h1>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{upcomingSessions.length}</div>
          <div className={styles.statLabel}>Upcoming Sessions</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{pendingSessions.length}</div>
          <div className={styles.statLabel}>Pending Confirmation</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{recentPayments.length}</div>
          <div className={styles.statLabel}>Recent Payments</div>
        </div>
      </div>

      <div className={styles.sections}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Upcoming Sessions</h2>
            <Link href="/admin/sessions" className={styles.seeAll}>
              View all
            </Link>
          </div>
          {upcomingSessions.length === 0 ? (
            <p className={styles.empty}>No upcoming sessions.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {upcomingSessions.map((session) => (
                  <tr key={session.id}>
                    <td>
                      {session.customer?.firstName}{" "}
                      {session.customer?.lastName}
                    </td>
                    <td className={styles.capitalize}>
                      {session.sessionType}
                    </td>
                    <td>
                      {session.scheduledAt
                        ? new Date(session.scheduledAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )
                        : "—"}
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${styles[`badge_${session.status}`]}`}
                      >
                        {session.status}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/admin/sessions/${session.id}`}
                        className={styles.link}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Payments</h2>
          </div>
          {recentPayments.length === 0 ? (
            <p className={styles.empty}>No recent payments.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      {payment.session?.customer?.firstName}{" "}
                      {payment.session?.customer?.lastName}
                    </td>
                    <td>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(payment.amountCents / 100)}
                    </td>
                    <td className={styles.capitalize}>{payment.paymentType}</td>
                    <td>
                      {payment.paidAt
                        ? new Date(payment.paidAt).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
