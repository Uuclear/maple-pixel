"use client";

import { usePixelStore } from "@/lib/store/pixel-store";

export function ColorPicker() {
  const { palette, currentColor, setColor } = usePixelStore();

  return (
    <div className="pixel-panel p-2">
      <div
        className="text-xs font-bold mb-2"
        style={{ color: "var(--accent)" }}
      >
        调色板
      </div>

      {/* Current color preview */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 pixel-border"
          style={{ backgroundColor: currentColor }}
        />
        <input
          type="color"
          value={currentColor}
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8 cursor-pointer"
        />
        <span
          className="text-xs font-mono"
          style={{ color: "var(--text-secondary)" }}
        >
          {currentColor}
        </span>
      </div>

      {/* Palette grid */}
      <div className="grid grid-cols-6 gap-1">
        {palette.map((color, i) => (
          <button
            key={i}
            className="w-5 h-5 pixel-border"
            style={{
              backgroundColor: color,
              outline:
                currentColor === color
                  ? "2px solid var(--accent)"
                  : "none",
              outlineOffset: "1px",
            }}
            onClick={() => setColor(color)}
          />
        ))}
      </div>
    </div>
  );
}
