import type { Config } from "drizzle-kit";

// Drizzle Kit CLI doesn't read .env.local automatically (Next.js does, but drizzle-kit doesn't).
// Use Node 20.12+'s built-in loadEnvFile so db:push / db:generate work without extra tooling.
if (typeof (process as { loadEnvFile?: unknown }).loadEnvFile === "function") {
  try {
    (process as { loadEnvFile: (path: string) => void }).loadEnvFile(".env.local");
  } catch {
    // .env.local not found — assume env vars are set in the environment (e.g. CI/prod)
  }
}

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
