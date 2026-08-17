import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { employees } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("orgId");
  const rows = orgId
    ? await db.select().from(employees).where(eq(employees.orgId, orgId))
    : await db.select().from(employees);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const required = ["orgId", "employeeTypeId", "firstName", "lastName", "basePayRate", "employmentStartDate"];
  const missing = required.filter((f) => body[f] === undefined || body[f] === null);
  if (missing.length) {
    return NextResponse.json({ error: `Missing required fields: ${missing.join(", ")}` }, { status: 400 });
  }
  const row = {
    id: randomUUID(),
    orgId: body.orgId,
    employeeTypeId: body.employeeTypeId,
    workScheduleId: body.workScheduleId ?? null,
    awardId: body.awardId ?? null,
    managerId: body.managerId ?? null,
    firstName: body.firstName,
    lastName: body.lastName,
    basePayRate: body.basePayRate,
    employmentStartDate: body.employmentStartDate,
    status: body.status ?? "active",
  };
  await db.insert(employees).values(row);
  return NextResponse.json(row, { status: 201 });
}
