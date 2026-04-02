import { GeminiClient } from "../gemini";
import { CRITIC_PROMPT } from "../prompts/critic";
import type { SynthesisResult, GapAnalysisResult } from "../types";

interface GapAnalysisInput {
  researchBrief: string;
  synthesis: SynthesisResult;
}

export function buildGapAnalysisPrompt(input: GapAnalysisInput): string {
  return `## Research Brief
${input.researchBrief}

## Current Synthesis

**Narrative:**
${input.synthesis.narrative}

**Key Agreements:**
${input.synthesis.agreements.map((a) => `- ${a}`).join("\n")}

**Contradictions:**
${input.synthesis.contradictions.length > 0 ? input.synthesis.contradictions.map((c) => `- ${c}`).join("\n") : "None identified"}

**Trends:**
${input.synthesis.trends.map((t) => `- ${t}`).join("\n")}

Evaluate the completeness and quality of this research against the brief.`;
}

export async function runGapAnalysisTask(
  client: GeminiClient,
  input: GapAnalysisInput,
  customPrompt?: string
): Promise<GapAnalysisResult> {
  const systemPrompt = customPrompt || CRITIC_PROMPT;
  const userMessage = buildGapAnalysisPrompt(input);

  const response = await client.generate(systemPrompt, userMessage);

  const parsed = JSON.parse(response.text);
  return {
    coveredAreas: parsed.coveredAreas || [],
    gaps: parsed.gaps || [],
    overallCoverage: parsed.overallCoverage || "moderate",
  };
}
