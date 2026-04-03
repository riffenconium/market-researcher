"use client";

import Link from "next/link";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    autonomy_level: string;
    created_at: string;
    sources?: any[];
  };
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <Link href={`/project/${project.id}`} className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-900">
            {project.title}
          </h3>
        </Link>
        <button
          onClick={() => onDelete(project.id)}
          className="text-gray-400 hover:text-red-500 text-sm ml-2"
        >
          Delete
        </button>
      </div>
      {project.description && (
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description}</p>
      )}
      <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
          {project.autonomy_level}
        </span>
        <span>{new Date(project.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
