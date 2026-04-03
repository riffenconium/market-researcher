import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { ingestFile } from "@/ingest";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const projectId = formData.get("projectId") as string | null;

  if (!file || !projectId) {
    return NextResponse.json({ error: "file and projectId are required" }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase().slice(1);
  const allowedTypes = ["pdf", "docx", "xlsx", "csv"];
  if (!allowedTypes.includes(ext)) {
    return NextResponse.json({ error: `Unsupported file type: ${ext}` }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadPath = path.join(process.cwd(), "uploads", `${Date.now()}-${file.name}`);
  await writeFile(uploadPath, buffer);

  const db = getDb();
  const sourceId = await ingestFile(db, {
    projectId,
    fileName: file.name,
    fileType: ext as "pdf" | "docx" | "xlsx" | "csv",
    buffer,
  });

  return NextResponse.json({ sourceId }, { status: 201 });
}
