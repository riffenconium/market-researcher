import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { createProject, getProjects } from "@/db/queries";

export async function GET() {
  const db = getDb();
  const projects = getProjects(db);
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, description, researchBrief, autonomyLevel } = body;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const db = getDb();
  const id = createProject(db, {
    title,
    description: description || "",
    researchBrief: researchBrief || "",
    autonomyLevel: autonomyLevel || "guided",
  });

  return NextResponse.json({ id }, { status: 201 });
}
