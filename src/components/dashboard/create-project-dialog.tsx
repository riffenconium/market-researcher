"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (project: { title: string; description: string; researchBrief: string; autonomyLevel: string }) => void;
}

export function CreateProjectDialog({ open, onClose, onCreate }: CreateProjectDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [researchBrief, setResearchBrief] = useState("");
  const [autonomyLevel, setAutonomyLevel] = useState("guided");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onCreate({ title, description, researchBrief, autonomyLevel });
    setTitle("");
    setDescription("");
    setResearchBrief("");
    setAutonomyLevel("guided");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title="New Research Project">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Coconut Industry Analysis" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief project description" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Research Brief</label>
          <Textarea
            value={researchBrief}
            onChange={(e) => setResearchBrief(e.target.value)}
            placeholder="Describe what you want to research: topics, regions, specific questions..."
            rows={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Autonomy Level</label>
          <select
            value={autonomyLevel}
            onChange={(e) => setAutonomyLevel(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="autonomous">Fully Autonomous</option>
            <option value="guided">Guided (approve plan first)</option>
            <option value="checkpoint">Checkpoint (pause at milestones)</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>Create Project</Button>
        </div>
      </div>
    </Dialog>
  );
}
