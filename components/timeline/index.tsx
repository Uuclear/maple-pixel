"use client";

import { PlaybackControls } from "./playback-controls";
import { FrameStrip } from "./frame-strip";
import { usePixelStore } from "@/lib/store/pixel-store";
import { useEffect, useRef } from "react";

export function Timeline() {
  const { isPlaying, fps, activeFrameIndex, frames, setActiveFrame } =
    usePixelStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setActiveFrame((activeFrameIndex + 1) % frames.length);
      }, 1000 / fps);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, fps, activeFrameIndex, frames.length, setActiveFrame]);

  return (
    <footer
      className="h-28 shrink-0 flex flex-col"
      style={{
        background: "var(--bg-secondary)",
        borderTop: "2px solid var(--border-color)",
      }}
    >
      {/* Controls row */}
      <div className="flex items-center h-8 shrink-0" style={{
        borderBottom: "1px solid var(--border-color)",
      }}>
        <PlaybackControls />
      </div>
      {/* Frame strip row */}
      <div className="flex-1 overflow-hidden py-2">
        <FrameStrip />
      </div>
    </footer>
  );
}
