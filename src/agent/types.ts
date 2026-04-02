export type AgentType =
  | "orchestrator"
  | "researcher"
  | "synthesizer"
  | "critic"
  | "slide-architect"
  | "domain-expert"
  | "economist"
  | "policy-analyst"
  | "custom";

export type TaskType = "plan" | "analyze" | "synthesize" | "gap-analysis" | "outline";

export type AutonomyLevel = "autonomous" | "guided" | "checkpoint";

export interface AgentMessage {
  role: "user" | "model";
  content: string;
}

export interface AgentResponse {
  text: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface ResearchBrief {
  topic: string;
  description: string;
  autonomyLevel: AutonomyLevel;
}

export interface AnalysisResult {
  sourceId: string;
  sourceName: string;
  keyFindings: string[];
  dataPoints: { fact: string; source: string; page?: string }[];
  themes: string[];
}

export interface SynthesisResult {
  narrative: string;
  agreements: string[];
  contradictions: string[];
  trends: string[];
  dataPoints: { fact: string; sources: string[] }[];
}

export interface GapAnalysisResult {
  coveredAreas: string[];
  gaps: { area: string; severity: "low" | "medium" | "high"; suggestion: string }[];
  overallCoverage: "strong" | "moderate" | "weak";
}

export interface SlideOutline {
  slides: {
    position: number;
    title: string;
    keyPoints: string[];
    supportingData: string[];
    sourcesCited: string[];
    speakerNotes: string;
  }[];
}
