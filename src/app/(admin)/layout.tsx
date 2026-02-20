import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminBottomNav } from "@/components/admin/AdminBottomNav";
import styles from "./layout.module.css";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.adminId) {
    redirect("/admin/signin");
  }

  return (
    <div className={styles.layout}>
      <AdminSidebar userName={session.user.name ?? "Admin"} />
      <main className={styles.main}>{children}</main>
      <AdminBottomNav />
    </div>
  );
}
