"use client";

import Image from "next/image";
import type { Asset } from "@sprite-generator/shared-types";
import { useSheetEditorStore } from "./sheet-editor.store.js";

interface SheetGridProps {
  assets: Asset[];
}

export function SheetGrid({ assets }: SheetGridProps) {
  const { columns, rows, cellWidth, cellHeight, padding, placements, placeAsset, clearCell } =
    useSheetEditorStore();

  const getAssetAtCell = (row: number, col: number) => {
    const p = placements.find((p) => p.row === row && p.col === col);
    if (!p) return null;
    return assets.find((a) => a.id === p.assetId) ?? null;
  };

  const handleDrop = (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();
    const assetId = e.dataTransfer.getData("assetId");
    if (assetId) placeAsset(assetId, row, col);
  };

  return (
    <div
      className="inline-grid border border-gray-300 bg-gray-100"
      style={{
        gridTemplateColumns: `repeat(${columns}, ${cellWidth + padding * 2}px)`,
        gap: 0,
      }}
    >
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: columns }, (_, c) => {
          const asset = getAssetAtCell(r, c);
          return (
            <div
              key={`${r}-${c}`}
              className="relative border border-gray-200 bg-white flex items-center justify-center"
              style={{
                width: cellWidth + padding * 2,
                height: cellHeight + padding * 2,
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, r, c)}
              onClick={() => clearCell(r, c)}
            >
              {asset ? (
                <Image
                  src={asset.imageUrl}
                  alt={`Frame ${r}-${c}`}
                  width={cellWidth}
                  height={cellHeight}
                  style={{ imageRendering: "pixelated" }}
                  unoptimized
                />
              ) : (
                <span className="text-xs text-gray-400 font-mono">
                  {r},{c}
                </span>
              )}
            </div>
          );
        }),
      )}
    </div>
  );
}
