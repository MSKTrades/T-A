// Seeds one test org, matching the reference SOW you shared: day-worker bandwidth
// 7:30am–6pm, 8-hour standard day, flextime scheme, three employee types.
import { db } from "./client";
import {
  organizations,
  employeeTypes,
  workSchedules,
  awards,
  employees,
  workScheduleAssignments,
} from "./schema";
import { randomUUID } from "crypto";

function id() {
  return randomUUID();
}

async function seed() {
  const orgId = id();
  await db.insert(organizations).values({
    id: orgId,
    name: "Demo Client Pty Ltd",
    primaryJurisdiction: "Australia",
    subscriptionTier: "trial",
    timezone: "Australia/Sydney",
    defaultGeofencePolicy: "soft_warning",
    defaultToilBankingMultiplier: 1.0,
  });

  const awardId = id();
  await db.insert(awards).values({
    id: awardId,
    orgId,
    name: "Award #1 (from SOW Analysis)",
    jurisdiction: "Australia",
    defaultToilBankingMultiplier: 1.0,
  });

  const scheduleId = id();
  await db.insert(workSchedules).values({
    id: scheduleId,
    orgId,
    name: "Standard Day Worker (Mon-Fri)",
    standardDailyHours: 8,
    standardWeeklyHours: 40,
    bandwidthStart: "07:30",
    bandwidthEnd: "18:00",
    coreHoursStart: "09:00",
    coreHoursEnd: "16:00",
    daysPattern: "Mon-Fri",
  });

  const permTypeId = id();
  const casualTypeId = id();
  await db.insert(employeeTypes).values([
    {
      id: permTypeId,
      orgId,
      typeName: "Permanent",
      flextimeEligible: true,
      toilEligible: true,
      casualLoadingPct: null,
    },
    {
      id: casualTypeId,
      orgId,
      typeName: "Casual",
      flextimeEligible: false,
      toilEligible: false,
      casualLoadingPct: 25.0,
    },
  ]);

  const alexId = id();
  const priyaId = id();
  await db.insert(employees).values([
    {
      id: alexId,
      orgId,
      employeeTypeId: permTypeId,
      awardId,
      managerId: null,
      firstName: "Alex",
      lastName: "Nguyen",
      basePayRate: 42.5,
      employmentStartDate: "2023-02-01",
      status: "active",
    },
    {
      id: priyaId,
      orgId,
      employeeTypeId: casualTypeId,
      awardId,
      managerId: null,
      firstName: "Priya",
      lastName: "Kapoor",
      basePayRate: 31.0,
      employmentStartDate: "2025-06-15",
      status: "active",
    },
  ]);

  // Each employee's permanent work schedule assignment — open-ended (no endDate).
  await db.insert(workScheduleAssignments).values([
    {
      id: id(),
      orgId,
      employeeId: alexId,
      workScheduleId: scheduleId,
      startDate: "2023-02-01",
      endDate: null,
      assignmentType: "permanent",
    },
    {
      id: id(),
      orgId,
      employeeId: priyaId,
      workScheduleId: scheduleId,
      startDate: "2025-06-15",
      endDate: null,
      assignmentType: "permanent",
    },
  ]);

  console.log("Seeded org:", orgId, "award:", awardId, "schedule:", scheduleId);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
