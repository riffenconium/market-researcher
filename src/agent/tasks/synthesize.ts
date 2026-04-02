import { GeminiClient } from "../gemini";
import { SYNTHESIZER_PROMPT } from "../prompts/synthesizer";
import type { AnalysisResult, SynthesisResult } from "../types";

interface SynthesizeInput {
  researchBrief: string;
  analysisResults: AnalysisResult[];
}

export function buildSynthesizePrompt(input: SynthesizeInput): string {
  const sourceSummaries = input.analysisResults
    .map(
      (r) => `### Source: ${r.sourceName} (${r.sourceId})
**Key Findings:**
${r.keyFindings.map((f) => `- ${f}`).join("\n")}

**Data Points:**
${r.dataPoints.map((d) => `- ${d.fact} [${d.source}]`).join("\n")}

**Themes:** ${r.themes.join(", ")}`
    )
    .join("\n\n");

  return `## Research Brief
${input.researchBrief}

## Analysis Results from ${input.analysisResults.length} Sources

${sourceSummaries}

Synthesize these findings into a unified narrative.`;
}

export async function runSynthesizeTask(
  client: GeminiClient,
  input: SynthesizeInput,
  customPrompt?: string
): Promise<SynthesisResult> {
  const systemPrompt = customPrompt || SYNTHESIZER_PROMPT;
  const userMessage = buildSynthesizePrompt(input);

  const response = await client.generate(systemPrompt, userMessage);

  const parsed = JSON.parse(response.text);
  return {
    narrative: parsed.narrative || "",
    agreements: parsed.agreements || [],
    contradictions: parsed.contradictions || [],
    trends: parsed.trends || [],
    dataPoints: parsed.dataPoints || [],
  };
}
