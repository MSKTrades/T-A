import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { organizations } from "@/db/schema";
import { randomUUID } from "crypto";

export async function GET() {
  const rows = await db.select().from(organizations);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name || !body.primaryJurisdiction) {
    return NextResponse.json(
      { error: "name and primaryJurisdiction are required" },
      { status: 400 }
    );
  }
  const row = {
    id: randomUUID(),
    name: body.name,
    primaryJurisdiction: body.primaryJurisdiction,
    subscriptionTier: body.subscriptionTier ?? "trial",
    timezone: body.timezone ?? "Australia/Sydney",
    defaultGeofencePolicy: body.defaultGeofencePolicy ?? "soft_warning",
    defaultToilBankingMultiplier: body.defaultToilBankingMultiplier ?? 1.0,
  };
  await db.insert(organizations).values(row);
  return NextResponse.json(row, { status: 201 });
}
