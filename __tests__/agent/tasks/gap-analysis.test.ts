import { buildGapAnalysisPrompt } from "@/agent/tasks/gap-analysis";

describe("buildGapAnalysisPrompt", () => {
  test("includes research brief and synthesis in the prompt", () => {
    const prompt = buildGapAnalysisPrompt({
      researchBrief: "Analyze global and regional coconut trends including pricing",
      synthesis: {
        narrative: "The coconut industry has seen steady growth...",
        agreements: ["Production is growing"],
        contradictions: [],
        trends: ["Rising demand for VCO"],
        dataPoints: [],
      },
    });

    expect(prompt).toContain("global and regional coconut trends");
    expect(prompt).toContain("steady growth");
    expect(prompt).toContain("Rising demand for VCO");
  });
});
