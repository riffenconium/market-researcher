import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { getProject, updateProject, deleteProject, getSourcesByProject, getSlidesByProject } from "@/db/queries";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const project = getProject(db, id);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const sources = getSourcesByProject(db, id);
  const slides = getSlidesByProject(db, id);

  return NextResponse.json({ ...project, sources, slides });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const db = getDb();
  updateProject(db, id, body);
  return NextResponse.json({ success: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  deleteProject(db, id);
  return NextResponse.json({ success: true });
}
