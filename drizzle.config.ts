import type { Config } from "drizzle-kit";

// Postgres now (Neon/Supabase, via Vercel's Storage integration) — see src/db/client.ts.
export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
