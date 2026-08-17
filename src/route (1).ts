import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { workSchedules } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("orgId");
  const rows = orgId
    ? await db.select().from(workSchedules).where(eq(workSchedules.orgId, orgId))
    : await db.select().from(workSchedules);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.orgId || !body.name || !body.standardDailyHours || !body.standardWeeklyHours) {
    return NextResponse.json(
      { error: "orgId, name, standardDailyHours, standardWeeklyHours are required" },
      { status: 400 }
    );
  }
  const row = {
    id: randomUUID(),
    orgId: body.orgId,
    name: body.name,
    standardDailyHours: body.standardDailyHours,
    standardWeeklyHours: body.standardWeeklyHours,
    bandwidthStart: body.bandwidthStart ?? null,
    bandwidthEnd: body.bandwidthEnd ?? null,
    coreHoursStart: body.coreHoursStart ?? null,
    coreHoursEnd: body.coreHoursEnd ?? null,
    daysPattern: body.daysPattern ?? "Mon-Fri",
  };
  await db.insert(workSchedules).values(row);
  return NextResponse.json(row, { status: 201 });
}
