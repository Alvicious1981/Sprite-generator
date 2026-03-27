import React, { useRef, useEffect } from "react";

interface CheckerboardCanvasProps {
  width: number;
  height: number;
  tileSize?: number;
  className?: string;
}

/**
 * Renders a checkerboard background pattern (used to indicate transparency in sprite previews).
 */
export function CheckerboardCanvas({
  width,
  height,
  tileSize = 8,
  className = "",
}: CheckerboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    for (let row = 0; row < Math.ceil(height / tileSize); row++) {
      for (let col = 0; col < Math.ceil(width / tileSize); col++) {
        ctx.fillStyle = (row + col) % 2 === 0 ? "#ffffff" : "#cccccc";
        ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
      }
    }
  }, [width, height, tileSize]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
