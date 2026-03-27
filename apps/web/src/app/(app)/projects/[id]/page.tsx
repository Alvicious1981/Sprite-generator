"use client";

import { use } from "react";
import { useProjectFull } from "@/features/projects/use-projects.js";
import { useGenerateSprite } from "@/features/assets/use-assets.js";
import { AnimationPreview } from "@/features/animation-preview/AnimationPreview.js";
import { SheetGrid } from "@/features/sheet-editor/SheetGrid.js";
import { ExportPanel } from "@/features/export/ExportPanel.js";
import Image from "next/image";
import type { Asset } from "@sprite-generator/shared-types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectPage({ params }: PageProps) {
  const { id } = use(params);
  const { data, isLoading, error } = useProjectFull(id);
  const generate = useGenerateSprite(id);

  const [prompt, setPrompt] = React.useState("");

  if (isLoading) return <div className="p-8 text-gray-500">Loading project...</div>;
  if (error) return <div className="p-8 text-red-600">Failed to load project</div>;
  if (!data) return null;

  const { project, assets, animations, sheetLayout } = data;
  const sprites = assets.filter((a) => a.kind === "sprite");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    await generate.mutateAsync({ projectId: id, prompt });
    setPrompt("");
  };

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <p className="text-sm text-gray-500 capitalize mt-1">
          {project.engineTarget} · {project.defaultCellWidth}×{project.defaultCellHeight}px ·{" "}
          {project.stylePreset}
        </p>
      </div>

      {/* Generate */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-lg">Generate Sprite</h2>
        <form onSubmit={handleGenerate} className="flex gap-3">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. medieval knight idle pose, sword at side"
            className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={generate.isPending || !prompt.trim()}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {generate.isPending ? "Generating..." : "Generate"}
          </button>
        </form>
      </section>

      {/* Assets */}
      <section>
        <h2 className="mb-4 font-semibold text-lg">Assets ({sprites.length})</h2>
        <div className="flex flex-wrap gap-3">
          {sprites.map((asset) => (
            <AssetTile key={asset.id} asset={asset} />
          ))}
        </div>
      </section>

      {/* Animation Preview */}
      {animations.length > 0 && (
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-lg">Animations</h2>
          <div className="space-y-6">
            {animations.map((anim) => (
              <div key={anim.id}>
                <p className="mb-2 text-sm font-medium">{anim.name}</p>
                <AnimationPreview
                  animation={anim}
                  assets={assets}
                  cellWidth={project.defaultCellWidth}
                  cellHeight={project.defaultCellHeight}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sheet Editor */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-lg">Sheet Layout</h2>
        <SheetGrid assets={sprites} />
      </section>

      {/* Export */}
      <ExportPanel projectId={id} />
    </div>
  );
}

// Need to import React for useState usage in this file
import React from "react";

function AssetTile({ asset }: { asset: Asset }) {
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData("assetId", asset.id)}
      className="group relative cursor-grab rounded-md border border-gray-200 bg-white p-1 hover:border-indigo-400 transition-colors"
      title={asset.prompt}
    >
      <Image
        src={asset.imageUrl}
        alt={asset.prompt ?? "Sprite"}
        width={64}
        height={64}
        style={{ imageRendering: "pixelated" }}
        unoptimized
      />
    </div>
  );
}
