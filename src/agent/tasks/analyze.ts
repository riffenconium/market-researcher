import { GeminiClient } from "../gemini";
import { RESEARCHER_PROMPT } from "../prompts/researcher";
import type { AnalysisResult } from "../types";

interface AnalyzeInput {
  sourceId: string;
  sourceName: string;
  content: string;
  focus: string;
}

export function buildAnalyzePrompt(input: AnalyzeInput): string {
  return `Analyze the following source document.

## Source: ${input.sourceName} (ID: ${input.sourceId})

## Focus Areas
${input.focus}

## Document Content

${input.content}`;
}

export async function runAnalyzeTask(
  client: GeminiClient,
  input: AnalyzeInput,
  customPrompt?: string
): Promise<AnalysisResult> {
  const systemPrompt = customPrompt || RESEARCHER_PROMPT;
  const userMessage = buildAnalyzePrompt(input);

  const response = await client.generate(systemPrompt, userMessage);

  const parsed = JSON.parse(response.text);
  return {
    sourceId: input.sourceId,
    sourceName: input.sourceName,
    keyFindings: parsed.keyFindings || [],
    dataPoints: parsed.dataPoints || [],
    themes: parsed.themes || [],
  };
}
