"use client";

import { usePixelStore } from "@/lib/store/pixel-store";

export function PlaybackControls() {
  const { isPlaying, fps, setFps, togglePlayback } = usePixelStore();

  return (
    <div className="flex items-center gap-2 px-2">
      {/* Play/Pause */}
      <button
        className="pixel-btn px-3 py-1"
        style={{
          background: "var(--bg-tertiary)",
          color: "var(--text-primary)",
        }}
        onClick={togglePlayback}
      >
        {isPlaying ? "⏸" : "▶"}
      </button>

      {/* FPS control */}
      <div className="flex items-center gap-1">
        <span
          className="text-xs"
          style={{ color: "var(--text-secondary)" }}
        >
          FPS:
        </span>
        <input
          type="number"
          min={1}
          max={60}
          value={fps}
          onChange={(e) => setFps(Number(e.target.value))}
          className="w-12 px-1 py-1 text-xs"
          style={{
            background: "var(--bg-primary)",
            border: "2px solid var(--border-color)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      {/* Loop toggle */}
      <label className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
        <input type="checkbox" defaultChecked />
        Loop
      </label>
    </div>
  );
}
