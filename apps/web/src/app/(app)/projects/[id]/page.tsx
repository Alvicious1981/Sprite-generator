"use client";

import React, { use, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useProjectFull } from "@/features/projects/use-projects.js";
import {
  useGenerateSprite,
  useUploadReference,
  useDeleteAsset,
} from "@/features/assets/use-assets.js";
import { AnimationPreview } from "@/features/animation-preview/AnimationPreview.js";
import { SheetGrid } from "@/features/sheet-editor/SheetGrid.js";
import { ExportPanel } from "@/features/export/ExportPanel.js";
import type { Asset } from "@sprite-generator/shared-types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectPage({ params }: PageProps) {
  const { id } = use(params);
  const { data, isLoading, error } = useProjectFull(id);
  const generate = useGenerateSprite(id);
  const uploadRef = useUploadReference(id);
  const deleteAsset = useDeleteAsset(id);

  const [prompt, setPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isLoading) return <div className="p-8 text-gray-500">Loading project...</div>;
  if (error) return <div className="p-8 text-red-600">Failed to load project</div>;
  if (!data) return null;

  const { project, assets, animations } = data;
  const sprites = assets.filter((a) => a.kind === "sprite");
  const references = assets.filter((a) => a.kind === "reference");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    await generate.mutateAsync({ projectId: id, prompt });
    setPrompt("");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadRef.mutateAsync(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/projects" className="text-sm text-gray-500 hover:text-gray-900">
          ← Projects
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-sm text-gray-500 capitalize mt-0.5">
            {project.engineTarget} · {project.defaultCellWidth}×{project.defaultCellHeight}px · {project.stylePreset}
          </p>
        </div>
      </div>

      {/* Generate Sprite */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-lg">Generate Sprite</h2>
        <form onSubmit={handleGenerate} className="flex gap-3">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. medieval knight idle pose, sword at side, pixel art"
            className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={generate.isPending || !prompt.trim()}
            className="rounded-md bg-indigo-600 px-5 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {generate.isPending ? "Generating…" : "Generate"}
          </button>
        </form>
      </section>

      {/* Reference Upload */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Reference Images ({references.length})</h2>
          <label className="cursor-pointer rounded-md border border-gray-300 px-4 py-1.5 text-sm hover:bg-gray-50">
            {uploadRef.isPending ? "Uploading…" : "Upload Reference"}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploadRef.isPending}
            />
          </label>
        </div>
        {references.length === 0 ? (
          <p className="text-sm text-gray-400">No reference images yet. Upload one to guide generation.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {references.map((asset) => (
              <AssetTile
                key={asset.id}
                asset={asset}
                onDelete={() => deleteAsset.mutate(asset.id)}
                size={64}
                draggable={false}
              />
            ))}
          </div>
        )}
      </section>

      {/* Generated Sprites */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-lg">Sprites ({sprites.length})</h2>
        {sprites.length === 0 ? (
          <p className="text-sm text-gray-400">No sprites yet. Use the form above to generate one.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {sprites.map((asset) => (
              <AssetTile
                key={asset.id}
                asset={asset}
                onDelete={() => deleteAsset.mutate(asset.id)}
                size={64}
                draggable
              />
            ))}
          </div>
        )}
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
        <p className="mb-3 text-xs text-gray-500">Drag sprites from the list above onto the grid.</p>
        <SheetGrid assets={sprites} />
      </section>

      {/* Export */}
      <ExportPanel projectId={id} />
    </div>
  );
}

interface AssetTileProps {
  asset: Asset;
  onDelete: () => void;
  size: number;
  draggable?: boolean;
}

function AssetTile({ asset, onDelete, size, draggable = false }: AssetTileProps) {
  return (
    <div
      draggable={draggable}
      onDragStart={draggable ? (e) => e.dataTransfer.setData("assetId", asset.id) : undefined}
      className="group relative rounded-md border border-gray-200 bg-white p-1 hover:border-indigo-400 transition-colors"
      title={asset.prompt ?? asset.kind}
      style={{ cursor: draggable ? "grab" : "default" }}
    >
      <Image
        src={asset.imageUrl}
        alt={asset.prompt ?? asset.kind}
        width={size}
        height={size}
        style={{ imageRendering: "pixelated" }}
        unoptimized
      />
      <button
        onClick={onDelete}
        className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white group-hover:flex"
        title="Delete"
      >
        ✕
      </button>
    </div>
  );
}
