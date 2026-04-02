import { GeminiClient } from "../gemini";
import { SLIDE_ARCHITECT_PROMPT } from "../prompts/slide-architect";
import type { SynthesisResult, GapAnalysisResult, SlideOutline } from "../types";

interface OutlineInput {
  researchBrief: string;
  synthesis: SynthesisResult;
  gapAnalysis: GapAnalysisResult;
  deepDivePrompt?: string;
}

export function buildOutlinePrompt(input: OutlineInput): string {
  const gapSection = input.gapAnalysis.gaps.length > 0
    ? `**Known Gaps (address where possible, note where data is unavailable):**
${input.gapAnalysis.gaps.map((g) => `- [${g.severity}] ${g.area}: ${g.suggestion}`).join("\n")}`
    : "No significant gaps identified.";

  const modeSection = input.deepDivePrompt
    ? `## Deep-Dive Focus\nThis is a focused deep-dive. The specific question to address:\n${input.deepDivePrompt}`
    : `## Mode: Full Deck\nCreate a complete presentation following the standard structure.`;

  return `## Research Brief
${input.researchBrief}

${modeSection}

## Synthesized Research

**Narrative:**
${input.synthesis.narrative}

**Key Findings:**
${input.synthesis.agreements.map((a) => `- ${a}`).join("\n")}

**Trends:**
${input.synthesis.trends.map((t) => `- ${t}`).join("\n")}

**Data Points:**
${input.synthesis.dataPoints.map((d) => `- ${d.fact} [Sources: ${d.sources.join(", ")}]`).join("\n")}

## Quality Assessment
Coverage: ${input.gapAnalysis.overallCoverage}
${gapSection}

Create the slide outline.`;
}

export async function runOutlineTask(
  client: GeminiClient,
  input: OutlineInput,
  customPrompt?: string
): Promise<SlideOutline> {
  const systemPrompt = customPrompt || SLIDE_ARCHITECT_PROMPT;
  const userMessage = buildOutlinePrompt(input);

  const response = await client.generate(systemPrompt, userMessage);

  const parsed = JSON.parse(response.text);
  return {
    slides: parsed.slides || [],
  };
}
