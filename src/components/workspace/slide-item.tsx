"use client";

import { useState } from "react";

interface SlideItemProps {
  slide: {
    id: string;
    position: number;
    title: string;
    body: string;
    speaker_notes: string;
    is_deep_dive: number;
  };
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
}

export function SlideItem({ slide, onUpdate, onDelete }: SlideItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(slide.title);
  const [body, setBody] = useState(slide.body);

  const handleSave = () => {
    onUpdate(slide.id, { title, body });
    setEditing(false);
  };

  return (
    <div className={`border rounded-lg p-3 ${slide.is_deep_dive ? "border-purple-200 bg-purple-50" : "border-gray-200 bg-white"}`}>
      <div className="flex items-start gap-2">
        <span className="text-xs font-mono text-gray-400 mt-0.5">{slide.position}</span>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-2">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full text-sm font-medium border rounded px-2 py-1" />
              <textarea value={body} onChange={(e) => setBody(e.target.value)} className="w-full text-xs border rounded px-2 py-1" rows={3} />
              <div className="flex gap-1">
                <button onClick={handleSave} className="text-xs text-blue-600 hover:underline">Save</button>
                <button onClick={() => setEditing(false)} className="text-xs text-gray-400 hover:underline">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-800 cursor-pointer hover:text-blue-900" onClick={() => setExpanded(!expanded)}>
                {slide.title}
              </p>
              {expanded && (
                <div className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">{slide.body}</div>
              )}
            </>
          )}
        </div>
        <div className="flex gap-1">
          <button onClick={() => setEditing(true)} className="text-xs text-gray-400 hover:text-blue-600">Edit</button>
          <button onClick={() => onDelete(slide.id)} className="text-xs text-gray-400 hover:text-red-500">x</button>
        </div>
      </div>
    </div>
  );
}
