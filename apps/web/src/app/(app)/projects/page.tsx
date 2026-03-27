"use client";

import { useState } from "react";
import Link from "next/link";
import { useProjects, useCreateProject } from "@/features/projects/use-projects.js";
import type { CreateProjectInput } from "@sprite-generator/shared-types";

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const [showForm, setShowForm] = useState(false);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input: CreateProjectInput = {
      name: String(fd.get("name")),
      engineTarget: fd.get("engineTarget") as "godot" | "unity" | "generic",
      defaultCellWidth: Number(fd.get("cellWidth")),
      defaultCellHeight: Number(fd.get("cellHeight")),
      stylePreset: String(fd.get("stylePreset")),
      transparentBackground: true,
      exportScale: 1,
    };
    await createProject.mutateAsync(input);
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Projects</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          New Project
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold">New Project</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium">Name</label>
              <input name="name" required className="w-full rounded-md border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Engine</label>
              <select name="engineTarget" className="w-full rounded-md border px-3 py-2 text-sm">
                <option value="godot">Godot</option>
                <option value="unity">Unity</option>
                <option value="generic">Generic</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Style</label>
              <select name="stylePreset" className="w-full rounded-md border px-3 py-2 text-sm">
                <option value="pixel_art">Pixel Art</option>
                <option value="painted">Painted</option>
                <option value="cartoon">Cartoon</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Cell Width (px)</label>
              <select name="cellWidth" className="w-full rounded-md border px-3 py-2 text-sm">
                <option value="16">16</option>
                <option value="32" selected>32</option>
                <option value="64">64</option>
                <option value="128">128</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Cell Height (px)</label>
              <select name="cellHeight" className="w-full rounded-md border px-3 py-2 text-sm">
                <option value="16">16</option>
                <option value="32" selected>32</option>
                <option value="64">64</option>
                <option value="128">128</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-md border px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProject.isPending}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {createProject.isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      )}

      {projects && projects.length === 0 ? (
        <p className="text-gray-500">No projects yet. Create your first one!</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects?.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold">{project.name}</h3>
              <p className="mt-1 text-sm text-gray-500 capitalize">{project.engineTarget}</p>
              <p className="mt-1 text-xs text-gray-400">
                {project.defaultCellWidth}×{project.defaultCellHeight}px · {project.stylePreset}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
