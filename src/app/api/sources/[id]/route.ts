import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { deleteSource } from "@/db/queries";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  deleteSource(db, id);
  return NextResponse.json({ success: true });
}
