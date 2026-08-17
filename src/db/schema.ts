// Sprint 1.1 — core master data: Organization, EmployeeType, WorkSchedule, Award, Employee.
// Built with Drizzle ORM against SQLite for local dev (no external DB account needed yet).
// Table shapes intentionally follow TA_App_Data_Model.md so moving the `provider` to Postgres
// later (Neon/Supabase) is a config change, not a redesign — see drizzle.config.ts.

import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  primaryJurisdiction: text("primary_jurisdiction").notNull(),
  subscriptionTier: text("subscription_tier").notNull().default("trial"),
  timezone: text("timezone").notNull().default("Australia/Sydney"),
  defaultGeofencePolicy: text("default_geofence_policy").notNull().default("soft_warning"),
  defaultToilBankingMultiplier: real("default_toil_banking_multiplier").notNull().default(1.0),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const employeeTypes = sqliteTable("employee_types", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull().references(() => organizations.id),
  typeName: text("type_name").notNull(), // Permanent / Temporary / Casual
  flextimeEligible: integer("flextime_eligible", { mode: "boolean" }).notNull().default(false),
  toilEligible: integer("toil_eligible", { mode: "boolean" }).notNull().default(false),
  casualLoadingPct: real("casual_loading_pct"),
});

export const workSchedules = sqliteTable("work_schedules", {
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

export const awards = sqliteTable("awards", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  jurisdiction: text("jurisdiction").notNull(),
  defaultToilBankingMultiplier: real("default_toil_banking_multiplier").notNull().default(1.0),
});

export const employees = sqliteTable("employees", {
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
