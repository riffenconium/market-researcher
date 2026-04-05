import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { getSetting, setSetting } from "@/db/queries";

export async function GET() {
  const db = getDb();
  return NextResponse.json({
    defaultAutonomy: getSetting(db, "defaultAutonomy") || "guided",
    geminiModel: getSetting(db, "geminiModel") || "gemini-2.5-flash",
  });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const db = getDb();

  for (const [key, value] of Object.entries(body)) {
    if (typeof value === "string") {
      setSetting(db, key, value);
    }
  }

  return NextResponse.json({ success: true });
}
