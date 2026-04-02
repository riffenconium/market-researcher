import { buildSynthesizePrompt } from "@/agent/tasks/synthesize";

describe("buildSynthesizePrompt", () => {
  test("includes all analysis results in the prompt", () => {
    const prompt = buildSynthesizePrompt({
      researchBrief: "Analyze global coconut trends",
      analysisResults: [
        {
          sourceId: "src-1",
          sourceName: "FAO Report",
          keyFindings: ["Global production reached 65M tonnes"],
          dataPoints: [{ fact: "65M tonnes", source: "FAO Report, p.3" }],
          themes: ["production"],
        },
        {
          sourceId: "src-2",
          sourceName: "Trade Data",
          keyFindings: ["Exports grew 8% YoY"],
          dataPoints: [{ fact: "8% export growth", source: "Trade Data, table 2" }],
          themes: ["trade"],
        },
      ],
    });

    expect(prompt).toContain("FAO Report");
    expect(prompt).toContain("Trade Data");
    expect(prompt).toContain("65M tonnes");
    expect(prompt).toContain("8% export growth");
  });
});
