// Sprint 1.1 — core master data: Organization, EmployeeType, WorkSchedule, Award, Employee.
// Migrated from local SQLite to Postgres (Neon/Supabase-compatible) so writes actually
// persist once deployed — Vercel's serverless functions have a read-only filesystem, so a
// SQLite file baked into the deployment can be read but never durably written to.

import { pgTable, text, real, boolean, timestamp } from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  primaryJurisdiction: text("primary_jurisdiction").notNull(),
  subscriptionTier: text("subscription_tier").notNull().default("trial"),
  timezone: text("timezone").notNull().default("Australia/Sydney"),
  defaultGeofencePolicy: text("default_geofence_policy").notNull().default("soft_warning"),
  defaultToilBankingMultiplier: real("default_toil_banking_multiplier").notNull().default(1.0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const employeeTypes = pgTable("employee_types", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull().references(() => organizations.id),
  typeName: text("type_name").notNull(), // Permanent / Temporary / Casual
  flextimeEligible: boolean("flextime_eligible").notNull().default(false),
  toilEligible: boolean("toil_eligible").notNull().default(false),
  casualLoadingPct: real("casual_loading_pct"),
});

export const workSchedules = pgTable("work_schedules", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  standardDailyHours: real("standard_daily_hours").notNull(),
  standardWeeklyHours: real("standard_weekly_hours").notNull(),
  bandwidthStart: text("bandwidth_start"), // "07:30"
  bandwidthEnd: text("bandwidth_end"), // "18:00"
  coreHoursStart: text("core_hours_start"),
  coreHoursEnd: text("core_hours_end"),
  daysPattern: text("days_pattern").notNull().default("Mon-Fri"),
});

export const awards = pgTable("awards", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  jurisdiction: text("jurisdiction").notNull(),
  defaultToilBankingMultiplier: real("default_toil_banking_multiplier").notNull().default(1.0),
});

export const employees = pgTable("employees", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull().references(() => organizations.id),
  employeeTypeId: text("employee_type_id").notNull().references(() => employeeTypes.id),
  workScheduleId: text("work_schedule_id").references(() => workSchedules.id),
  awardId: text("award_id").references(() => awards.id),
  managerId: text("manager_id"), // self-reference, resolved at query time (hierarchy walk)
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  basePayRate: real("base_pay_rate").notNull(),
  employmentStartDate: text("employment_start_date").notNull(),
  status: text("status").notNull().default("active"),
});
