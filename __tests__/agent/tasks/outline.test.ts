import { buildOutlinePrompt } from "@/agent/tasks/outline";

describe("buildOutlinePrompt", () => {
  test("includes synthesis and gap results in the prompt", () => {
    const prompt = buildOutlinePrompt({
      researchBrief: "Coconut industry analysis",
      synthesis: {
        narrative: "The coconut industry is valued at $12B globally...",
        agreements: ["Market is growing"],
        contradictions: [],
        trends: ["VCO demand rising"],
        dataPoints: [{ fact: "$12B market", sources: ["FAO Report"] }],
      },
      gapAnalysis: {
        coveredAreas: ["Market size", "Growth"],
        gaps: [{ area: "Pricing", severity: "medium", suggestion: "Add pricing section" }],
        overallCoverage: "moderate",
      },
    });

    expect(prompt).toContain("$12B globally");
    expect(prompt).toContain("Pricing");
    expect(prompt).toContain("moderate");
  });
});
