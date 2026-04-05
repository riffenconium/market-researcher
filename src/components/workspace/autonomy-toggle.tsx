"use client";

interface AutonomyToggleProps {
  value: string;
  onChange: (level: string) => void;
}

export function AutonomyToggle({ value, onChange }: AutonomyToggleProps) {
  const levels = [
    { id: "autonomous", label: "Auto", desc: "Runs end-to-end" },
    { id: "guided", label: "Guided", desc: "Approve plan first" },
    { id: "checkpoint", label: "Checkpoint", desc: "Pause at milestones" },
  ];

  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {levels.map((level) => (
        <button
          key={level.id}
          onClick={() => onChange(level.id)}
          className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
            value === level.id
              ? "bg-white text-blue-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
          title={level.desc}
        >
          {level.label}
        </button>
      ))}
    </div>
  );
}
