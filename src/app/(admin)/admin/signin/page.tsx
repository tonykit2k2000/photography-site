import { signIn } from "@/lib/auth";
import styles from "./page.module.css";

export default function SignInPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Tony Kitt Photography</h1>
        <p className={styles.subtitle}>
          Sign in with your authorized Google account to access the admin dashboard.
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/admin" });
          }}
        >
          <button type="submit" className={styles.googleBtn}>
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"
              />
              <path
                fill="#34A853"
                d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.78-2.7.78-2.08 0-3.84-1.4-4.47-3.29H1.9v2.07A8 8 0 0 0 8.98 17z"
              />
              <path
                fill="#FBBC05"
                d="M4.51 10.54A4.8 4.8 0 0 1 4.26 9c0-.53.09-1.05.25-1.54V5.39H1.9A8 8 0 0 0 1 9c0 1.29.31 2.51.9 3.61l2.61-2.07z"
              />
              <path
                fill="#EA4335"
                d="M8.98 3.58c1.17 0 2.22.4 3.05 1.2l2.28-2.28A8 8 0 0 0 8.98 1 8 8 0 0 0 1.9 5.39l2.61 2.07c.63-1.9 2.39-3.28 4.47-3.28z"
              />
            </svg>
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  );
}
