"use client";

import { usePixelStore } from "@/lib/store/pixel-store";

export function BrushSettings() {
  const { brushSize, setBrushSize } = usePixelStore();

  return (
    <div className="pixel-panel p-2">
      <div
        className="text-xs font-bold mb-2"
        style={{ color: "var(--accent)" }}
      >
        笔刷
      </div>
      <div className="flex items-center gap-2">
        <span
          className="text-xs"
          style={{ color: "var(--text-secondary)" }}
        >
          大小: {brushSize}px
        </span>
        <input
          type="range"
          min={1}
          max={16}
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="flex-1"
        />
      </div>
      {/* Brush preview */}
      <div className="flex justify-center mt-2">
        <div
          className="bg-white"
          style={{
            width: `${brushSize * 3}px`,
            height: `${brushSize * 3}px`,
          }}
        />
      </div>
    </div>
  );
}
