import { useState, useEffect, useRef, useCallback } from "react";
import type { PreviewState } from "@sprite-generator/shared-types";

interface UsePreviewOptions {
  frameUrls: string[];
  initialFps?: number;
  loop?: boolean;
}

export function usePreview({ frameUrls, initialFps = 8, loop = true }: UsePreviewOptions) {
  const [state, setState] = useState<PreviewState>({
    animationId: "",
    fps: initialFps,
    currentFrameIndex: 0,
    isPlaying: false,
    loop,
    zoom: 2,
    showCheckerboard: true,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    clearTimer();
    if (!state.isPlaying || frameUrls.length === 0) return;

    intervalRef.current = setInterval(() => {
      setState((prev) => {
        const next = prev.currentFrameIndex + 1;
        if (next >= frameUrls.length) {
          if (prev.loop) return { ...prev, currentFrameIndex: 0 };
          clearTimer();
          return { ...prev, isPlaying: false };
        }
        return { ...prev, currentFrameIndex: next };
      });
    }, 1000 / state.fps);

    return clearTimer;
  }, [state.isPlaying, state.fps, state.loop, frameUrls.length, clearTimer]);

  const play = () => setState((p) => ({ ...p, isPlaying: true }));
  const pause = () => setState((p) => ({ ...p, isPlaying: false }));
  const toggle = () => setState((p) => ({ ...p, isPlaying: !p.isPlaying }));
  const setFrame = (i: number) => setState((p) => ({ ...p, currentFrameIndex: i }));
  const setFps = (fps: number) => setState((p) => ({ ...p, fps }));
  const setZoom = (zoom: PreviewState["zoom"]) => setState((p) => ({ ...p, zoom }));
  const toggleCheckerboard = () =>
    setState((p) => ({ ...p, showCheckerboard: !p.showCheckerboard }));

  return {
    state,
    currentFrameUrl: frameUrls[state.currentFrameIndex] ?? null,
    play,
    pause,
    toggle,
    setFrame,
    setFps,
    setZoom,
    toggleCheckerboard,
  };
}
