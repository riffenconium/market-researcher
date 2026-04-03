import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { ingestText } from "@/ingest";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { projectId, name, text } = body;

  if (!projectId || !name || !text) {
    return NextResponse.json({ error: "projectId, name, and text are required" }, { status: 400 });
  }

  const db = getDb();
  const sourceId = await ingestText(db, { projectId, name, text });

  return NextResponse.json({ sourceId }, { status: 201 });
}
