import type { Config } from "drizzle-kit";

// Local SQLite for now. To move to Neon/Supabase (Postgres) later:
// 1. swap dialect to "postgresql" and point dbCredentials at the connection string
// 2. change schema.ts table builders from sqlite-core to pg-core (same shape, different import)
// This file is the one place the "which database" decision lives.
export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./data/ta-app.db",
  },
} satisfies Config;
