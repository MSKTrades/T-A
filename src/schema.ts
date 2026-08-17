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
  // NOTE: no workScheduleId here anymore — which schedule applies to an employee is now
  // resolved by date from workScheduleAssignments below, not a single fixed field. This is
  // what makes a "temporary schedule for a few days" possible without touching the
  // employee's permanent assignment, and it's resolved the same way regardless of whether
  // the clock in/out that gets valued against it came from this app or an external system.
  awardId: text("award_id").references(() => awards.id),
  managerId: text("manager_id"), // self-reference, resolved at query time (hierarchy walk)
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  basePayRate: real("base_pay_rate").notNull(),
  employmentStartDate: text("employment_start_date").notNull(),
  status: text("status").notNull().default("active"),
});

// An employee's work schedule over time, not a single fixed value. A "permanent" row
// normally has no endDate (open-ended, in effect until superseded). A "temporary" row has
// both dates set — e.g. covering a project secondment — and once endDate passes, whichever
// row covers "today" again (the permanent one, or a later temporary one) takes over
// automatically. Resolution is always "find the assignment covering date X," which is why
// it doesn't matter whether time data is captured here or imported from elsewhere.
export const workScheduleAssignments = pgTable("work_schedule_assignments", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull().references(() => organizations.id),
  employeeId: text("employee_id").notNull().references(() => employees.id),
  workScheduleId: text("work_schedule_id").notNull().references(() => workSchedules.id),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"), // null = open-ended (the permanent/current assignment)
  assignmentType: text("assignment_type").notNull().default("permanent"), // permanent | temporary
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
