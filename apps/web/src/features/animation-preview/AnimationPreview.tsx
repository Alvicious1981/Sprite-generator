"use client";

import { useRef, useEffect } from "react";
import { usePreview } from "./use-preview.js";
import type { Asset, Animation } from "@sprite-generator/shared-types";

interface AnimationPreviewProps {
  animation: Animation;
  assets: Asset[];
  cellWidth: number;
  cellHeight: number;
}

export function AnimationPreview({
  animation,
  assets,
  cellWidth,
  cellHeight,
}: AnimationPreviewProps) {
  const frameUrls = animation.frameIds
    .map((id) => assets.find((a) => a.id === id)?.imageUrl)
    .filter((url): url is string => !!url);

  const {
    state,
    currentFrameUrl,
    toggle,
    setFrame,
    setFps,
    setZoom,
    toggleCheckerboard,
  } = usePreview({ frameUrls, initialFps: animation.fps, loop: animation.loop });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentFrameUrl) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = currentFrameUrl;
  }, [currentFrameUrl]);

  const displaySize = cellWidth * state.zoom;
  const displayHeight = cellHeight * state.zoom;

  return (
    <div className="flex flex-col gap-3">
      {/* Canvas */}
      <div className="relative inline-block">
        {state.showCheckerboard && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(45deg,#ccc 25%,transparent 25%)," +
                "linear-gradient(-45deg,#ccc 25%,transparent 25%)," +
                "linear-gradient(45deg,transparent 75%,#ccc 75%)," +
                "linear-gradient(-45deg,transparent 75%,#ccc 75%)",
              backgroundSize: "16px 16px",
              backgroundPosition: "0 0,0 8px,8px -8px,-8px 0px",
            }}
          />
        )}
        <canvas
          ref={canvasRef}
          width={displaySize}
          height={displayHeight}
          className="relative"
          style={{ imageRendering: "pixelated" }}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={toggle}
          className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700"
        >
          {state.isPlaying ? "Pause" : "Play"}
        </button>

        <div className="flex items-center gap-2 text-sm">
          <span>FPS:</span>
          <input
            type="number"
            value={state.fps}
            min={1}
            max={120}
            onChange={(e) => setFps(Number(e.target.value))}
            className="w-16 rounded-md border px-2 py-1 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span>Zoom:</span>
          {([1, 2, 4, 8] as const).map((z) => (
            <button
              key={z}
              onClick={() => setZoom(z)}
              className={[
                "rounded px-2 py-0.5 text-xs",
                state.zoom === z
                  ? "bg-indigo-600 text-white"
                  : "border border-gray-300 hover:bg-gray-100",
              ].join(" ")}
            >
              {z}x
            </button>
          ))}
        </div>

        <button
          onClick={toggleCheckerboard}
          className="rounded-md border border-gray-300 px-3 py-1 text-xs hover:bg-gray-100"
        >
          {state.showCheckerboard ? "Hide BG" : "Show BG"}
        </button>
      </div>

      {/* Scrubber */}
      <div className="flex flex-wrap gap-1">
        {frameUrls.map((_, i) => (
          <button
            key={i}
            onClick={() => setFrame(i)}
            className={[
              "h-6 w-6 rounded text-xs font-mono",
              state.currentFrameIndex === i
                ? "bg-indigo-600 text-white"
                : "border border-gray-300 hover:bg-gray-100",
            ].join(" ")}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  );
}
