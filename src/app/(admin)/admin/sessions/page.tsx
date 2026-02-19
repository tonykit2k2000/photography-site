import { db } from "@/db";
import { sessions } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import styles from "./page.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sessions — Admin" };

export default async function SessionsListPage() {
  const allSessions = await db.query.sessions.findMany({
    orderBy: desc(sessions.scheduledAt),
    with: { customer: true },
  });

  return (
    <div>
      <h1 className={styles.heading}>All Sessions</h1>

      {allSessions.length === 0 ? (
        <p className={styles.empty}>No sessions yet.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Type</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {allSessions.map((session) => (
                <tr key={session.id}>
                  <td>
                    {session.customer?.firstName} {session.customer?.lastName}
                  </td>
                  <td>{session.customer?.email}</td>
                  <td className={styles.capitalize}>{session.sessionType}</td>
                  <td>
                    {session.scheduledAt
                      ? new Date(session.scheduledAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )
                      : "—"}
                  </td>
                  <td>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(session.totalPriceCents / 100)}
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
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
