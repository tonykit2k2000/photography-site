import Link from "next/link";
import { signOut } from "@/lib/auth";
import styles from "./AdminSidebar.module.css";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/sessions", label: "Sessions", icon: "📅" },
  { href: "/admin/galleries", label: "Galleries", icon: "🖼️" },
  { href: "/admin/blog", label: "Blog", icon: "✍️" },
];

interface AdminSidebarProps {
  userName: string;
}

export function AdminSidebar({ userName }: AdminSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>Tony Kitt Photography</div>
      <p className={styles.user}>Signed in as {userName}</p>

      <nav className={styles.nav}>
        <ul role="list">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={styles.navLink}>
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/admin/signin" });
        }}
        className={styles.signOutForm}
      >
        <button type="submit" className={styles.signOut}>
          Sign Out
        </button>
      </form>
    </aside>
  );
}
