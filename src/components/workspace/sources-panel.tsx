"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SourcesPanelProps {
  projectId: string;
  sources: any[];
  onSourceAdded: () => void;
}

export function SourcesPanel({ projectId, sources, onSourceAdded }: SourcesPanelProps) {
  const [mode, setMode] = useState<"file" | "url" | "text" | null>(null);
  const [url, setUrl] = useState("");
  const [textName, setTextName] = useState("");
  const [textContent, setTextContent] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectId", projectId);

    await fetch("/api/sources/upload", { method: "POST", body: formData });
    setLoading(false);
    onSourceAdded();
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleUrlAdd = async () => {
    if (!url.trim()) return;
    setLoading(true);
    await fetch("/api/sources/url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, url }),
    });
    setUrl("");
    setLoading(false);
    onSourceAdded();
  };

  const handleTextAdd = async () => {
    if (!textName.trim() || !textContent.trim()) return;
    setLoading(true);
    await fetch("/api/sources/text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, name: textName, text: textContent }),
    });
    setTextName("");
    setTextContent("");
    setLoading(false);
    onSourceAdded();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/sources/${id}`, { method: "DELETE" });
    onSourceAdded();
  };

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    ready: "bg-green-100 text-green-700",
    error: "bg-red-100 text-red-700",
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Sources</h2>
        <div className="flex gap-1">
          <Button size="sm" variant={mode === "file" ? "primary" : "secondary"} onClick={() => setMode("file")}>File</Button>
          <Button size="sm" variant={mode === "url" ? "primary" : "secondary"} onClick={() => setMode("url")}>URL</Button>
          <Button size="sm" variant={mode === "text" ? "primary" : "secondary"} onClick={() => setMode("text")}>Text</Button>
        </div>

        {mode === "file" && (
          <div className="mt-2">
            <input ref={fileRef} type="file" accept=".pdf,.docx,.xlsx,.csv" onChange={handleFileUpload} className="text-sm" />
          </div>
        )}

        {mode === "url" && (
          <div className="mt-2 flex gap-2">
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="flex-1" />
            <Button size="sm" onClick={handleUrlAdd} disabled={loading}>Add</Button>
          </div>
        )}

        {mode === "text" && (
          <div className="mt-2 space-y-2">
            <Input value={textName} onChange={(e) => setTextName(e.target.value)} placeholder="Source name" />
            <Textarea value={textContent} onChange={(e) => setTextContent(e.target.value)} placeholder="Paste text..." rows={3} />
            <Button size="sm" onClick={handleTextAdd} disabled={loading}>Add</Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {sources.length === 0 ? (
          <p className="text-xs text-gray-400 text-center mt-4">No sources added yet</p>
        ) : (
          <ul className="space-y-2">
            {sources.map((source: any) => (
              <li key={source.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{source.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400 uppercase">{source.type}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusColor[source.status] || ""}`}>{source.status}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(source.id)} className="text-gray-400 hover:text-red-500 text-xs ml-2">x</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
