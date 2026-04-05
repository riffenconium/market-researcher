"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

export function AgentPanel({ projectId, autonomyLevel, onAutonomyChange, onRunComplete }: AgentPanelProps) {
  const [deepDivePrompt, setDeepDivePrompt] = useState("");
  const [running, setRunning] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const activityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!runId) return;

    const eventSource = new EventSource(`/api/agent/stream?runId=${runId}`);

    eventSource.onmessage = (e) => {
      const event: ActivityEvent = JSON.parse(e.data);
      setActivity((prev) => [...prev, event]);

      if (event.status === "completed" && event.taskType === "complete") {
        setRunning(false);
        setRunId(null);
        onRunComplete();
        eventSource.close();
      }

      if (event.status === "progress" && event.message.includes("Paused")) {
        setPaused(true);
      }

      if (event.status === "error") {
        setRunning(false);
        setRunId(null);
        eventSource.close();
      }
    };

    return () => eventSource.close();
  }, [runId, onRunComplete]);

  useEffect(() => {
    if (activityRef.current) {
      activityRef.current.scrollTop = activityRef.current.scrollHeight;
    }
  }, [activity]);

  const handleRun = async (deepDive?: string) => {
    setRunning(true);
    setActivity([]);
    setPaused(false);

    const res = await fetch("/api/agent/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, deepDivePrompt: deepDive || undefined }),
    });

    const data = await res.json();
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
  };

  const handleDeepDive = () => {
    if (!deepDivePrompt.trim()) return;
    handleRun(deepDivePrompt);
    setDeepDivePrompt("");
  };

  const agentColors: Record<string, string> = {
    orchestrator: "text-blue-600",
    researcher: "text-green-600",
    synthesizer: "text-purple-600",
    critic: "text-orange-600",
    "slide-architect": "text-pink-600",
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-200 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Agent</h2>
        <AutonomyToggle value={autonomyLevel} onChange={onAutonomyChange} />

        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleRun()} disabled={running}>
            {running ? "Running..." : "Run Research"}
          </Button>
          {paused && (
            <Button size="sm" variant="secondary" onClick={handleResume}>Resume</Button>
          )}
        </div>
      </div>

      <div ref={activityRef} className="flex-1 overflow-y-auto p-3">
        {activity.length === 0 ? (
          <p className="text-xs text-gray-400 text-center mt-4">Agent activity will appear here</p>
        ) : (
          <div className="space-y-1.5">
            {activity.map((event, i) => (
              <div key={i} className="text-xs">
                <span className={`font-medium ${agentColors[event.agentType] || "text-gray-600"}`}>
                  [{event.agentType}]
                </span>{" "}
                <span className="text-gray-600">{event.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-200">
        <Textarea
          value={deepDivePrompt}
          onChange={(e) => setDeepDivePrompt(e.target.value)}
          placeholder="Ask a deep-dive question..."
          rows={2}
        />
        <Button size="sm" className="mt-2 w-full" variant="secondary" onClick={handleDeepDive} disabled={running || !deepDivePrompt.trim()}>
          Deep Dive
        </Button>
      </div>
    </div>
  );
}
