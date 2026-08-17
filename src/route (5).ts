import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { workScheduleAssignments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  const employeeId = req.nextUrl.searchParams.get("employeeId");
  const rows = employeeId
    ? await db
        .select()
        .from(workScheduleAssignments)
        .where(eq(workScheduleAssignments.employeeId, employeeId))
    : await db.select().from(workScheduleAssignments);
  return NextResponse.json(rows);
}

function addDaysToIsoDate(iso: string, days: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const required = ["orgId", "employeeId", "workScheduleId", "startDate"];
  const missing = required.filter((f) => !body[f]);
  if (missing.length) {
    return NextResponse.json({ error: `Missing required fields: ${missing.join(", ")}` }, { status: 400 });
  }

  const endDate: string | null = body.endDate || null;
  const assignmentType = endDate ? "temporary" : "permanent";
  const newStart = body.startDate;
  const newEnd = endDate ?? "9999-12-31"; // open-ended sorts as "forever" for range comparisons

  const existing = await db
    .select()
    .from(workScheduleAssignments)
    .where(eq(workScheduleAssignments.employeeId, body.employeeId));

  if (assignmentType === "temporary") {
    // A temporary assignment is allowed to sit on top of an ongoing permanent one — that's
    // the whole point (the employee reverts to it automatically once this ends). Only
    // reject if it overlaps ANOTHER temporary assignment, which would be genuinely
    // ambiguous (two different "current" schedules on the same day).
    const clashesWithTemp = existing
      .filter((a) => a.assignmentType === "temporary")
      .some((a) => {
        const aEnd = a.endDate ?? "9999-12-31";
        return newStart <= aEnd && a.startDate <= newEnd;
      });
    if (clashesWithTemp) {
      return NextResponse.json(
        { error: "This date range overlaps another temporary assignment already on file for this employee." },
        { status: 409 }
      );
    }
  } else {
    // A new permanent assignment supersedes whichever permanent assignment was previously
    // "current" — close it out (set its endDate to the day before this one starts) instead
    // of leaving two open-ended rows, which would make "what's their permanent schedule"
    // ambiguous going forward.
    const priorPermanent = existing.find((a) => a.assignmentType === "permanent" && a.endDate === null);
    if (priorPermanent) {
      await db
        .update(workScheduleAssignments)
        .set({ endDate: addDaysToIsoDate(newStart, -1) })
        .where(eq(workScheduleAssignments.id, priorPermanent.id));
    }
  }

  const row = {
    id: randomUUID(),
    orgId: body.orgId,
    employeeId: body.employeeId,
    workScheduleId: body.workScheduleId,
    startDate: body.startDate,
    endDate,
    assignmentType,
    reason: body.reason ?? null,
  };
  await db.insert(workScheduleAssignments).values(row);
  return NextResponse.json(row, { status: 201 });
}
