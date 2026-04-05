"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { SourcesPanel } from "@/components/workspace/sources-panel";
import { OutlinePanel } from "@/components/workspace/outline-panel";
import { AgentPanel } from "@/components/workspace/agent-panel";
import { Button } from "@/components/ui/button";

export default function ProjectWorkspace() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProject = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}`);
    const data = await res.json();
    setProject(data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleAutonomyChange = async (level: string) => {
    await fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ autonomyLevel: level }),
    });
    fetchProject();
  };

  const handleUpdateSlide = async (id: string, updates: any) => {
    setProject((prev: any) => ({
      ...prev,
      slides: prev.slides.map((s: any) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const handleDeleteSlide = async (id: string) => {
    setProject((prev: any) => ({
      ...prev,
      slides: prev.slides.filter((s: any) => s.id !== id),
    }));
  };

  const handleExport = async () => {
    const res = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    });

    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.title || "research"}.pptx`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-400">Loading...</div>;
  }

  if (!project) {
    return <div className="p-8 text-red-500">Project not found</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
        <div>
          <h1 className="text-lg font-bold text-gray-900">{project.title}</h1>
          <p className="text-xs text-gray-500">{project.description}</p>
        </div>
        <Button onClick={handleExport} disabled={!project.slides?.length}>Export PPTX</Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 border-r border-gray-200 bg-white">
          <SourcesPanel projectId={projectId} sources={project.sources || []} onSourceAdded={fetchProject} />
        </div>

        <div className="flex-1 bg-gray-50">
          <OutlinePanel slides={project.slides || []} onUpdateSlide={handleUpdateSlide} onDeleteSlide={handleDeleteSlide} />
        </div>

        <div className="w-80 border-l border-gray-200 bg-white">
          <AgentPanel projectId={projectId} autonomyLevel={project.autonomy_level} onAutonomyChange={handleAutonomyChange} onRunComplete={fetchProject} />
        </div>
      </div>
    </div>
  );
}
