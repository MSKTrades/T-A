import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { awards } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("orgId");
  const rows = orgId
    ? await db.select().from(awards).where(eq(awards.orgId, orgId))
    : await db.select().from(awards);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.orgId || !body.name || !body.jurisdiction) {
    return NextResponse.json(
      { error: "orgId, name, jurisdiction are required" },
      { status: 400 }
    );
  }
  const row = {
    id: randomUUID(),
    orgId: body.orgId,
    name: body.name,
    jurisdiction: body.jurisdiction,
    defaultToilBankingMultiplier: body.defaultToilBankingMultiplier ?? 1.0,
  };
  await db.insert(awards).values(row);
  return NextResponse.json(row, { status: 201 });
}
