"use client";

import { SlideItem } from "./slide-item";

interface OutlinePanelProps {
  slides: any[];
  onUpdateSlide: (id: string, updates: any) => void;
  onDeleteSlide: (id: string) => void;
}

export function OutlinePanel({ slides, onUpdateSlide, onDeleteSlide }: OutlinePanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700">
          Slide Outline
          {slides.length > 0 && <span className="text-gray-400 font-normal ml-1">({slides.length} slides)</span>}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {slides.length === 0 ? (
          <p className="text-xs text-gray-400 text-center mt-4">No slides yet — run the agent to generate an outline</p>
        ) : (
          <div className="space-y-2">
            {slides.map((slide: any) => (
              <SlideItem key={slide.id} slide={slide} onUpdate={onUpdateSlide} onDelete={onDeleteSlide} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
