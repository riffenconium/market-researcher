import { buildAnalyzePrompt } from "@/agent/tasks/analyze";

describe("buildAnalyzePrompt", () => {
  test("includes source content and focus areas in the prompt", () => {
    const prompt = buildAnalyzePrompt({
      sourceId: "src-1",
      sourceName: "FAO Report 2025",
      content: "Indonesia produced 18 million tonnes of coconut in 2025.",
      focus: "production volumes and growth trends",
    });

    expect(prompt).toContain("FAO Report 2025");
    expect(prompt).toContain("18 million tonnes");
    expect(prompt).toContain("production volumes");
  });
});
