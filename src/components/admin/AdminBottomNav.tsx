import Link from "next/link";
import styles from "./AdminBottomNav.module.css";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/sessions", label: "Sessions", icon: "📅" },
  { href: "/admin/galleries", label: "Galleries", icon: "🖼️" },
  { href: "/admin/blog", label: "Blog", icon: "✍️" },
];

export function AdminBottomNav() {
  return (
    <nav className={styles.nav} aria-label="Mobile navigation">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} className={styles.link}>
          <span className={styles.icon} aria-hidden="true">{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
