import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { getProject, getChunksByProject, createAgentRun, updateAgentRun, createSlide, getAgentPrompt, getAgentRun } from "@/db/queries";
import { Orchestrator } from "@/agent/orchestrator";
import type { AutonomyLevel } from "@/agent/types";

const activeOrchestrators = new Map<string, Orchestrator>();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { projectId, deepDivePrompt } = body;

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const db = getDb();
  const project = getProject(db, projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  const chunks = getChunksByProject(db, projectId) as any[];

  const agentTypes = ["orchestrator", "researcher", "synthesizer", "critic", "slide-architect", "domain-expert", "economist", "policy-analyst"];
  const customPrompts: Record<string, string> = {};
  for (const type of agentTypes) {
    const prompt = getAgentPrompt(db, projectId, type);
    if (prompt) customPrompts[type] = prompt.system_prompt;
  }

  const runId = createAgentRun(db, projectId, project.autonomy_level);

  const orchestrator = new Orchestrator({
    apiKey,
    projectId,
    researchBrief: project.research_brief,
    autonomyLevel: project.autonomy_level as AutonomyLevel,
    chunks: chunks.map((c: any) => ({
      content: c.content,
      sourceId: c.source_id,
      sourceName: c.source_name,
    })),
    customPrompts,
    deepDivePrompt,
  });

  activeOrchestrators.set(runId, orchestrator);

  orchestrator.run(runId).then((result) => {
    if (result.outline) {
      for (const slide of result.outline.slides) {
        createSlide(db, {
          projectId,
          runId,
          position: slide.position,
          title: slide.title,
          body: slide.keyPoints.join("\n"),
          sourcesCited: JSON.stringify(slide.sourcesCited),
          speakerNotes: slide.speakerNotes,
          isDeepDive: !!deepDivePrompt,
          deepDivePrompt,
        });
      }
    }
    updateAgentRun(db, runId, "completed");
    activeOrchestrators.delete(runId);
  }).catch((error) => {
    updateAgentRun(db, runId, "failed");
    activeOrchestrators.delete(runId);
  });

  return NextResponse.json({ runId }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const runId = request.nextUrl.searchParams.get("runId");
  if (!runId) {
    return NextResponse.json({ error: "runId required" }, { status: 400 });
  }

  const orchestrator = activeOrchestrators.get(runId);
  if (!orchestrator) {
    const db = getDb();
    const run = getAgentRun(db, runId);
    return NextResponse.json({ status: run?.status || "unknown" });
  }

  return NextResponse.json(orchestrator.getStatus());
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { runId } = body;

  const orchestrator = activeOrchestrators.get(runId);
  if (!orchestrator) {
    return NextResponse.json({ error: "Run not found or already completed" }, { status: 404 });
  }

  orchestrator.resume();
  return NextResponse.json({ success: true });
}
