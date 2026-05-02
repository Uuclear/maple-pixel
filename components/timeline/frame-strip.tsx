"use client";

import { usePixelStore } from "@/lib/store/pixel-store";

export function FrameStrip() {
  const {
    frames,
    activeFrameIndex,
    setActiveFrame,
    addFrame,
    deleteFrame,
    duplicateFrame,
    canvas,
    layers,
  } = usePixelStore();

  return (
    <div className="flex items-center gap-2 flex-1 overflow-x-auto px-2">
      <div className="flex gap-2">
        {frames.map((frame, index) => (
          <div
            key={frame.id}
            className={`flex flex-col items-center cursor-pointer ${
              index === activeFrameIndex ? "pixel-border" : ""
            }`}
            style={{
              background:
                index === activeFrameIndex
                  ? "var(--bg-tertiary)"
                  : "var(--bg-primary)",
              padding: "4px",
            }}
            onClick={() => setActiveFrame(index)}
          >
            {/* Frame thumbnail */}
            <div
              className="w-12 h-12 pixel-border"
              style={{ background: "#1a1a1a" }}
            >
              <FrameThumbnail frame={frame} layers={layers} canvas={canvas} />
            </div>
            <span
              className="text-xs mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              F{index + 1}
            </span>
          </div>
        ))}

        {/* Add frame button */}
        <button
          className="w-12 h-12 pixel-border flex items-center justify-center text-lg"
          style={{
            background: "var(--bg-primary)",
            color: "var(--text-secondary)",
          }}
          onClick={addFrame}
        >
          +
        </button>
      </div>

      {/* Frame actions */}
      <div className="flex gap-1 shrink-0">
        <button
          className="pixel-btn px-2 py-1 text-xs"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-primary)",
          }}
          onClick={() => duplicateFrame(activeFrameIndex)}
        >
          复制
        </button>
        {frames.length > 1 && (
          <button
            className="pixel-btn px-2 py-1 text-xs"
            style={{
              background: "var(--danger)",
              color: "#fff",
            }}
            onClick={() => deleteFrame(activeFrameIndex)}
          >
            删除
          </button>
        )}
      </div>
    </div>
  );
}

function FrameThumbnail({
  frame,
  layers,
  canvas,
}: {
  frame: { id: string; layerData: Map<string, Map<string, string>> };
  layers: { id: string; visible: boolean; opacity: number }[];
  canvas: { width: number; height: number };
}) {
  return (
    <canvas
      ref={(el) => {
        if (!el) return;
        const ctx = el.getContext("2d");
        if (!ctx) return;
        const thumbSize = 48;
        el.width = thumbSize;
        el.height = thumbSize;
        ctx.imageSmoothingEnabled = false;
        const scale = thumbSize / Math.max(canvas.width, canvas.height);
        for (const layer of layers) {
          if (!layer.visible) continue;
          const pixels = frame.layerData.get(layer.id);
          if (!pixels) continue;
          ctx.globalAlpha = layer.opacity;
          for (const [key, color] of pixels) {
            const [x, y] = key.split(",").map(Number);
            ctx.fillStyle = color;
            ctx.fillRect(
              x * scale,
              y * scale,
              Math.max(1, scale),
              Math.max(1, scale)
            );
          }
        }
      }}
      className="w-full h-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
