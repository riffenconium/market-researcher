import { GeminiClient } from "./gemini";
import { runAnalyzeTask } from "./tasks/analyze";
import { runSynthesizeTask } from "./tasks/synthesize";
import { runGapAnalysisTask } from "./tasks/gap-analysis";
import { runOutlineTask } from "./tasks/outline";
import { ORCHESTRATOR_PROMPT } from "./prompts/orchestrator";
import { agentEvents, type AgentEvent } from "@/lib/events";
import type {
  AutonomyLevel,
  AnalysisResult,
  SynthesisResult,
  GapAnalysisResult,
  SlideOutline,
} from "./types";

type Phase = "idle" | "planning" | "analyzing" | "synthesizing" | "gap-checking" | "outlining" | "paused" | "completed" | "failed";

interface OrchestratorConfig {
  apiKey: string;
  projectId: string;
  researchBrief: string;
  autonomyLevel: AutonomyLevel;
  chunks?: { content: string; sourceId: string; sourceName: string }[];
  customPrompts?: Record<string, string>;
  deepDivePrompt?: string;
}

interface OrchestratorStatus {
  phase: Phase;
  completedSteps: string[];
  currentAgent?: string;
  error?: string;
}

interface OrchestratorResult {
  analysisResults: AnalysisResult[];
  synthesis: SynthesisResult | null;
  gapAnalysis: GapAnalysisResult | null;
  outline: SlideOutline | null;
}

export class Orchestrator {
  private client: GeminiClient;
  private config: OrchestratorConfig;
  private phase: Phase = "idle";
  private completedSteps: string[] = [];
  private runId: string = "";
  private result: OrchestratorResult = {
    analysisResults: [],
    synthesis: null,
    gapAnalysis: null,
    outline: null,
  };
  private pauseResolver: (() => void) | null = null;

  constructor(config: OrchestratorConfig) {
    this.config = config;
    this.client = new GeminiClient(config.apiKey);
  }

  getStatus(): OrchestratorStatus {
    return {
      phase: this.phase,
      completedSteps: [...this.completedSteps],
      error: undefined,
    };
  }

  getResult(): OrchestratorResult {
    return this.result;
  }

  resume(): void {
    if (this.pauseResolver) {
      this.pauseResolver();
      this.pauseResolver = null;
    }
  }

  private emit(agentType: string, taskType: string, status: AgentEvent["status"], message: string) {
    agentEvents.emit({
      runId: this.runId,
      agentType,
      taskType,
      status,
      message,
      timestamp: Date.now(),
    });
  }

  private async maybePause(checkpoint: string): Promise<void> {
    const shouldPause =
      (this.config.autonomyLevel === "guided" && checkpoint === "plan") ||
      (this.config.autonomyLevel === "checkpoint" &&
        ["plan", "gap-check", "outline"].includes(checkpoint));

    if (shouldPause) {
      this.phase = "paused";
      this.emit("orchestrator", checkpoint, "progress", `Paused at ${checkpoint} — awaiting approval`);
      await new Promise<void>((resolve) => {
        this.pauseResolver = resolve;
      });
    }
  }

  async run(runId: string): Promise<OrchestratorResult> {
    this.runId = runId;

    try {
      // Step 1: Plan
      this.phase = "planning";
      this.emit("orchestrator", "plan", "started", "Creating research plan...");

      const planResponse = await this.client.generate(
        this.config.customPrompts?.orchestrator || ORCHESTRATOR_PROMPT,
        `## Research Brief\n${this.config.researchBrief}\n\n## Available Sources\n${
          this.config.chunks
            ?.reduce((acc, c) => {
              if (!acc.includes(c.sourceName)) acc.push(c.sourceName);
              return acc;
            }, [] as string[])
            .map((s) => `- ${s}`)
            .join("\n") || "No sources uploaded yet."
        }`
      );

      let plan: any;
      try {
        plan = JSON.parse(planResponse.text);
      } catch {
        plan = { researchPlan: { analysisTasks: [], synthesisThemes: [], agentsNeeded: ["researcher", "synthesizer"] } };
      }

      this.completedSteps.push("plan");
      this.emit("orchestrator", "plan", "completed", `Research plan created with ${plan.researchPlan?.analysisTasks?.length || 0} tasks`);

      await this.maybePause("plan");

      // Step 2: Analyze
      this.phase = "analyzing";
      const chunks = this.config.chunks || [];

      // Group chunks by source
      const sourceGroups = new Map<string, { sourceId: string; sourceName: string; content: string[] }>();
      for (const chunk of chunks) {
        const existing = sourceGroups.get(chunk.sourceId);
        if (existing) {
          existing.content.push(chunk.content);
        } else {
          sourceGroups.set(chunk.sourceId, {
            sourceId: chunk.sourceId,
            sourceName: chunk.sourceName,
            content: [chunk.content],
          });
        }
      }

      for (const [sourceId, group] of sourceGroups) {
        this.emit("researcher", "analyze", "started", `Analyzing ${group.sourceName}...`);

        const analysisResult = await runAnalyzeTask(
          this.client,
          {
            sourceId: group.sourceId,
            sourceName: group.sourceName,
            content: group.content.join("\n\n"),
            focus: plan.researchPlan?.analysisTasks
              ?.filter((t: any) => t.sourceId === sourceId)
              ?.map((t: any) => t.focus)
              .join("; ") || "Extract all key data points and trends",
          },
          this.config.customPrompts?.researcher
        );

        this.result.analysisResults.push(analysisResult);
        this.emit("researcher", "analyze", "completed", `Completed analysis of ${group.sourceName}`);
      }

      this.completedSteps.push("analyze");

      // Step 3: Synthesize
      this.phase = "synthesizing";
      this.emit("synthesizer", "synthesize", "started", "Cross-referencing findings...");

      this.result.synthesis = await runSynthesizeTask(
        this.client,
        {
          researchBrief: this.config.researchBrief,
          analysisResults: this.result.analysisResults,
        },
        this.config.customPrompts?.synthesizer
      );

      this.completedSteps.push("synthesize");
      this.emit("synthesizer", "synthesize", "completed", "Synthesis complete");

      // Step 4: Gap Check
      this.phase = "gap-checking";
      this.emit("critic", "gap-analysis", "started", "Checking for gaps...");

      this.result.gapAnalysis = await runGapAnalysisTask(
        this.client,
        {
          researchBrief: this.config.researchBrief,
          synthesis: this.result.synthesis,
        },
        this.config.customPrompts?.critic
      );

      this.completedSteps.push("gap-check");
      this.emit("critic", "gap-analysis", "completed", `Coverage: ${this.result.gapAnalysis.overallCoverage}, ${this.result.gapAnalysis.gaps.length} gaps found`);

      await this.maybePause("gap-check");

      // Step 5: Outline
      this.phase = "outlining";
      this.emit("slide-architect", "outline", "started", "Creating slide outline...");

      this.result.outline = await runOutlineTask(
        this.client,
        {
          researchBrief: this.config.researchBrief,
          synthesis: this.result.synthesis,
          gapAnalysis: this.result.gapAnalysis,
          deepDivePrompt: this.config.deepDivePrompt,
        },
        this.config.customPrompts?.["slide-architect"]
      );

      this.completedSteps.push("outline");
      this.emit("slide-architect", "outline", "completed", `Outline created with ${this.result.outline.slides.length} slides`);

      await this.maybePause("outline");

      this.phase = "completed";
      this.emit("orchestrator", "complete", "completed", "Research pipeline completed");

      return this.result;
    } catch (error: any) {
      this.phase = "failed";
      this.emit("orchestrator", "error", "error", error.message);
      throw error;
    }
  }
}
