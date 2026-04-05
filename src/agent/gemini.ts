import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AgentResponse } from "./types";

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey: string, modelName: string = "gemini-2.5-flash") {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  buildPrompt(systemPrompt: string, userMessage: string): string {
    return `${systemPrompt}\n\n---\n\n${userMessage}`;
  }

  async generate(systemPrompt: string, userMessage: string): Promise<AgentResponse> {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(userMessage);
    const response = result.response;
    const text = response.text();
    const usage = response.usageMetadata;

    return {
      text,
      usage: usage
        ? {
            inputTokens: usage.promptTokenCount || 0,
            outputTokens: usage.candidatesTokenCount || 0,
          }
        : undefined,
    };
  }

  async generateWithContext(
    systemPrompt: string,
    context: string,
    userMessage: string
  ): Promise<AgentResponse> {
    const fullMessage = `## Context\n\n${context}\n\n## Task\n\n${userMessage}`;
    return this.generate(systemPrompt, fullMessage);
  }
}
