# T&A App — Sprint 1.1

Organization, EmployeeType, WorkSchedule, Award, Employee — basic CRUD, seeded with a
test org matching the reference SOW (day-worker bandwidth 7:30am–6pm, 8-hour standard day).

Built with Next.js (App Router) + Drizzle ORM + **Postgres** (Neon/Supabase in production via
Vercel's Storage tab; any local Postgres for dev). Originally built on local SQLite, migrated
to Postgres once deployed to Vercel — serverless functions there have a read-only filesystem,
so a SQLite file baked into the deployment could be read but writes never persisted.

## Run it locally

1. Get a Postgres connection string — either a local Postgres, or a free Neon/Supabase project.
2. Create `.env.local` in the project root:
   ```
   DATABASE_URL="postgres://user:password@host:5432/dbname"
   ```
3. Then:
   ```bash
   npm install
   npm run db:push      # creates tables from src/db/schema.ts
   npm run db:seed       # seeds one demo org + award + schedule + 2 employees
   npm run dev            # http://localhost:3000
   ```

## Deploying (Vercel)

1. In the Vercel project's **Storage** tab, add a Postgres database (Neon or Supabase) —
   Vercel sets `DATABASE_URL` automatically for you when you do this.
2. Push to GitHub; Vercel redeploys automatically.
3. Run `npm run db:push` and `npm run db:seed` once, pointed at the same `DATABASE_URL`
   Vercel is using, to create and seed the production tables (only needed once, or whenever
   the schema changes).

## What's here

- `src/db/schema.ts` — the sprint 1.1 tables, matching `TA_App_Data_Model.md`
- `src/db/seed.ts` — demo data seeded from the SOW
- `src/app/api/*/route.ts` — GET (list, optional `?orgId=` filter) + POST (create) for each entity
- `src/app/page.tsx` — a plain read-only admin view of everything seeded, to eyeball that it's wired up correctly

## Not yet built (next sprints per `TA_App_Build_Plan.md`)

- 1.2: RuleScenario schema + seeding the SOW's 40 scenarios
- 1.3–1.4: TimeType + TimeEvent capture + TimeSheetEntry generation
- 1.5: the valuation engine itself (the real product)
