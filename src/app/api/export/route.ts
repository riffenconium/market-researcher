import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { getProject, getSlidesByProject } from "@/db/queries";
import { generateDeck } from "@/export/pptx";
import type { SlideOutline } from "@/agent/types";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { projectId } = body;

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const db = getDb();
  const project = getProject(db, projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const slides = getSlidesByProject(db, projectId) as any[];
  if (slides.length === 0) {
    return NextResponse.json({ error: "No slides to export" }, { status: 400 });
  }

  const outline: SlideOutline = {
    slides: slides.map((s: any) => ({
      position: s.position,
      title: s.title,
      keyPoints: s.body.split("\n").filter(Boolean),
      supportingData: [],
      sourcesCited: JSON.parse(s.sources_cited || "[]"),
      speakerNotes: s.speaker_notes || "",
    })),
  };

  const buffer = await generateDeck(outline, project.title);

  const fileName = `${project.title.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.pptx`;
  const outputPath = path.join(process.cwd(), "output", fileName);
  await writeFile(outputPath, buffer);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
