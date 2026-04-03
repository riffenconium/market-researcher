import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { getAgentPrompt, upsertAgentPrompt } from "@/db/queries";

import { ORCHESTRATOR_PROMPT } from "@/agent/prompts/orchestrator";
import { RESEARCHER_PROMPT } from "@/agent/prompts/researcher";
import { SYNTHESIZER_PROMPT } from "@/agent/prompts/synthesizer";
import { CRITIC_PROMPT } from "@/agent/prompts/critic";
import { SLIDE_ARCHITECT_PROMPT } from "@/agent/prompts/slide-architect";
import { DOMAIN_EXPERT_PROMPT } from "@/agent/prompts/domain-expert";
import { ECONOMIST_PROMPT } from "@/agent/prompts/economist";
import { POLICY_ANALYST_PROMPT } from "@/agent/prompts/policy-analyst";

const DEFAULT_PROMPTS: Record<string, string> = {
  orchestrator: ORCHESTRATOR_PROMPT,
  researcher: RESEARCHER_PROMPT,
  synthesizer: SYNTHESIZER_PROMPT,
  critic: CRITIC_PROMPT,
  "slide-architect": SLIDE_ARCHITECT_PROMPT,
  "domain-expert": DOMAIN_EXPERT_PROMPT,
  economist: ECONOMIST_PROMPT,
  "policy-analyst": POLICY_ANALYST_PROMPT,
};

export async function GET(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }

  const db = getDb();
  const prompts: Record<string, { prompt: string; isCustom: boolean }> = {};

  for (const [agentType, defaultPrompt] of Object.entries(DEFAULT_PROMPTS)) {
    const custom = getAgentPrompt(db, projectId, agentType);
    prompts[agentType] = {
      prompt: custom ? custom.system_prompt : defaultPrompt,
      isCustom: !!custom,
    };
  }

  return NextResponse.json(prompts);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { projectId, agentType, systemPrompt } = body;

  if (!projectId || !agentType || !systemPrompt) {
    return NextResponse.json({ error: "projectId, agentType, and systemPrompt required" }, { status: 400 });
  }

  const db = getDb();
  upsertAgentPrompt(db, projectId, agentType, systemPrompt);

  return NextResponse.json({ success: true });
}
