import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

// DATABASE_URL comes from Vercel's Storage integration (Neon/Supabase) in production,
// or a local .env.local for development. Nothing else in the app changes when this
// value changes — that was the whole point of keeping schema.ts as the single source
// of truth for table shape, per TA_App_Data_Model.md.
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env.local for local dev, or connect a Postgres database in Vercel's Storage tab for deployment."
  );
}

const client = postgres(connectionString, { max: 1 });
export const db = drizzle(client, { schema });
