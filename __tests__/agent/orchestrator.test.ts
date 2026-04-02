import { Orchestrator } from "@/agent/orchestrator";

describe("Orchestrator", () => {
  test("can be constructed with required params", () => {
    const orch = new Orchestrator({
      apiKey: "test-key",
      projectId: "proj-1",
      researchBrief: "Analyze coconut trends",
      autonomyLevel: "guided",
    });
    expect(orch).toBeDefined();
  });

  test("getStatus returns initial state", () => {
    const orch = new Orchestrator({
      apiKey: "test-key",
      projectId: "proj-1",
      researchBrief: "Analyze coconut trends",
      autonomyLevel: "autonomous",
    });
    const status = orch.getStatus();
    expect(status.phase).toBe("idle");
    expect(status.completedSteps).toEqual([]);
  });
});
