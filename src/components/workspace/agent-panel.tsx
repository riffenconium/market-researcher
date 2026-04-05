"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { AutonomyToggle } from "./autonomy-toggle";

interface AgentPanelProps {
  projectId: string;
  autonomyLevel: string;
  onAutonomyChange: (level: string) => void;
  onRunComplete: () => void;
}

interface ActivityEvent {
  agentType: string;
  taskType: string;
  status: string;
  message: string;
  timestamp: number;
}

interface ChatMessage {
  id: number;
  type: "user" | "agent" | "system";
  agent?: string;
  content: string;
  timestamp: number;
}

const PIPELINE_STEPS = [
  { key: "plan", label: "Planning", icon: "1", agent: "orchestrator" },
  { key: "analyze", label: "Analyzing", icon: "2", agent: "researcher" },
  { key: "synthesize", label: "Synthesizing", icon: "3", agent: "synthesizer" },
  { key: "gap-check", label: "Gap Check", icon: "4", agent: "critic" },
  { key: "outline", label: "Outlining", icon: "5", agent: "slide-architect" },
  { key: "complete", label: "Complete", icon: "✓", agent: "orchestrator" },
];

const AGENT_META: Record<string, { name: string; color: string; bg: string }> = {
  orchestrator: { name: "Engagement Manager", color: "text-blue-700", bg: "bg-blue-100" },
  researcher: { name: "Research Analyst", color: "text-emerald-700", bg: "bg-emerald-100" },
  synthesizer: { name: "Insights Partner", color: "text-purple-700", bg: "bg-purple-100" },
  critic: { name: "QA Director", color: "text-amber-700", bg: "bg-amber-100" },
  "slide-architect": { name: "Slide Architect", color: "text-pink-700", bg: "bg-pink-100" },
  "domain-expert": { name: "Domain Expert", color: "text-cyan-700", bg: "bg-cyan-100" },
  economist: { name: "Economist", color: "text-indigo-700", bg: "bg-indigo-100" },
  "policy-analyst": { name: "Policy Analyst", color: "text-rose-700", bg: "bg-rose-100" },
};

export function AgentPanel({ projectId, autonomyLevel, onAutonomyChange, onRunComplete }: AgentPanelProps) {
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const msgId = useRef(0);

  const addMessage = (type: ChatMessage["type"], content: string, agent?: string) => {
    msgId.current++;
    setMessages((prev) => [...prev, { id: msgId.current, type, agent, content, timestamp: Date.now() }]);
  };

  // SSE connection
  useEffect(() => {
    if (!runId) return;

    const eventSource = new EventSource(`/api/agent/stream?runId=${runId}`);

    eventSource.onmessage = (e) => {
      const event: ActivityEvent = JSON.parse(e.data);

      // Update progress stepper
      if (event.status === "started") {
        setActiveStep(event.taskType);
      }
      if (event.status === "completed") {
        setCompletedSteps((prev) => new Set([...prev, event.taskType]));
        if (event.taskType === "complete") {
          setActiveStep("complete");
          setRunning(false);
          setRunId(null);
          addMessage("system", "Research pipeline completed. Your slides are ready.");
          onRunComplete();
          eventSource.close();
          return;
        }
      }

      if (event.status === "progress" && event.message.includes("Paused")) {
        setPaused(true);
        addMessage("system", "Paused — waiting for your approval to continue.");
        return;
      }

      if (event.status === "error") {
        setRunning(false);
        setRunId(null);
        addMessage("system", `Error: ${event.message}`);
        eventSource.close();
        return;
      }

      // Convert events to chat messages
      if (event.status === "started" || event.status === "completed") {
        addMessage("agent", event.message, event.agentType);
      }
    };

    return () => eventSource.close();
  }, [runId, onRunComplete]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleRun = async (deepDive?: string) => {
    setRunning(true);
    setMessages([]);
    setPaused(false);
    setCompletedSteps(new Set());
    setActiveStep(null);

    if (deepDive) {
      addMessage("user", deepDive);
      addMessage("system", "Starting deep-dive research...");
    } else {
      addMessage("system", "Starting research pipeline...");
    }

    const res = await fetch("/api/agent/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, deepDivePrompt: deepDive || undefined }),
    });

    const data = await res.json();
    if (data.error) {
      addMessage("system", `Error: ${data.error}`);
      setRunning(false);
      return;
    }
    setRunId(data.runId);
  };

  const handleResume = async () => {
    if (!runId) return;
    await fetch("/api/agent/run", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId }),
    });
    setPaused(false);
    addMessage("system", "Resuming pipeline...");
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    handleRun(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getStepStatus = (stepKey: string) => {
    if (completedSteps.has(stepKey)) return "completed";
    if (activeStep === stepKey) return "active";
    return "pending";
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header with settings toggle */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-900">Research Agent</h2>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            {showSettings ? "Hide" : "Settings"}
          </button>
        </div>
        {showSettings && (
          <div className="pb-2 space-y-2">
            <AutonomyToggle value={autonomyLevel} onChange={onAutonomyChange} />
          </div>
        )}
      </div>

      {/* Progress Stepper */}
      {running || completedSteps.size > 0 ? (
        <div className="px-4 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            {PIPELINE_STEPS.map((step, i) => {
              const status = getStepStatus(step.key);
              return (
                <div key={step.key} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        status === "completed"
                          ? "bg-green-500 text-white"
                          : status === "active"
                          ? "bg-blue-600 text-white animate-pulse"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {status === "completed" ? "✓" : step.icon}
                    </div>
                    <span
                      className={`text-[10px] mt-1 ${
                        status === "active"
                          ? "text-blue-600 font-medium"
                          : status === "completed"
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <div
                      className={`w-4 h-0.5 mx-0.5 mt-[-12px] ${
                        completedSteps.has(step.key) ? "bg-green-400" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Chat Messages */}
      <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
              <span className="text-blue-600 text-lg">AI</span>
            </div>
            <p className="text-sm font-medium text-gray-700">Research Agent</p>
            <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
              Click "Run Research" to analyze your sources, or type a specific question below.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.type === "system") {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1.5 rounded-full max-w-[90%] text-center">
                    {msg.content}
                  </div>
                </div>
              );
            }

            if (msg.type === "user") {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="bg-blue-600 text-white text-sm px-3.5 py-2 rounded-2xl rounded-br-md max-w-[85%]">
                    {msg.content}
                    <div className="text-[10px] text-blue-200 mt-1 text-right">{formatTime(msg.timestamp)}</div>
                  </div>
                </div>
              );
            }

            // Agent message
            const meta = AGENT_META[msg.agent || ""] || { name: msg.agent || "Agent", color: "text-gray-700", bg: "bg-gray-100" };
            return (
              <div key={msg.id} className="flex gap-2">
                <div className={`w-7 h-7 rounded-full ${meta.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <span className={`text-[10px] font-bold ${meta.color}`}>
                    {meta.name.split(" ").map((w) => w[0]).join("")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-xs font-semibold ${meta.color}`}>{meta.name}</span>
                    <span className="text-[10px] text-gray-300">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div className="bg-white text-sm text-gray-700 px-3.5 py-2 rounded-2xl rounded-tl-md mt-0.5 shadow-sm border border-gray-100">
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {running && !paused && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-blue-700">AI</span>
            </div>
            <div className="bg-white px-4 py-2.5 rounded-2xl rounded-tl-md shadow-sm border border-gray-100">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="px-3 py-3 bg-white border-t border-gray-200">
        {paused ? (
          <Button size="sm" className="w-full" onClick={handleResume}>
            Approve & Continue
          </Button>
        ) : (
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={running ? "Agent is working..." : "Ask a research question or click Run..."}
                disabled={running}
                rows={1}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none disabled:bg-gray-50 disabled:text-gray-400 pr-10"
                style={{ minHeight: "40px", maxHeight: "120px" }}
              />
            </div>
            {!running ? (
              input.trim() ? (
                <button
                  onClick={handleSend}
                  className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors flex-shrink-0"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => handleRun()}
                  className="h-9 px-3 rounded-full bg-blue-600 text-white text-xs font-medium flex items-center gap-1.5 hover:bg-blue-700 transition-colors flex-shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Run
                </button>
              )
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
