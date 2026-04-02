import { GeminiClient } from "@/agent/gemini";

describe("GeminiClient", () => {
  test("constructor sets model and API key", () => {
    const client = new GeminiClient("test-api-key");
    expect(client).toBeDefined();
  });

  test("buildPrompt combines system prompt and user message", () => {
    const client = new GeminiClient("test-api-key");
    const prompt = client.buildPrompt("You are a researcher.", "Analyze this document.");
    expect(prompt).toContain("You are a researcher.");
    expect(prompt).toContain("Analyze this document.");
  });
});
