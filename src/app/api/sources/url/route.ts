import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { ingestUrl } from "@/ingest";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { projectId, url } = body;

  if (!projectId || !url) {
    return NextResponse.json({ error: "projectId and url are required" }, { status: 400 });
  }

  const db = getDb();
  const sourceId = await ingestUrl(db, { projectId, url });

  return NextResponse.json({ sourceId }, { status: 201 });
}
