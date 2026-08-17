import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { employeeTypes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("orgId");
  const rows = orgId
    ? await db.select().from(employeeTypes).where(eq(employeeTypes.orgId, orgId))
    : await db.select().from(employeeTypes);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.orgId || !body.typeName) {
    return NextResponse.json({ error: "orgId and typeName are required" }, { status: 400 });
  }
  const row = {
    id: randomUUID(),
    orgId: body.orgId,
    typeName: body.typeName,
    flextimeEligible: !!body.flextimeEligible,
    toilEligible: !!body.toilEligible,
    casualLoadingPct: body.casualLoadingPct ?? null,
  };
  await db.insert(employeeTypes).values(row);
  return NextResponse.json(row, { status: 201 });
}
