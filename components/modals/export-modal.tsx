"use client";

import { useState } from "react";
import { usePixelStore } from "@/lib/store/pixel-store";
import { exportPNG, exportSpriteSheet, exportGIF } from "@/lib/canvas/export";

interface Props {
  onClose: () => void;
}

export function ExportModal({ onClose }: Props) {
  const { frames, layers, canvas, fps } = usePixelStore();
  const [format, setFormat] = useState<"png" | "gif" | "spritesheet">("png");
  const [pixelSize, setPixelSize] = useState(1);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);

    try {
      const activeFrame = frames[0];
      const ps = pixelSize;

      if (format === "png") {
        const dataUrl = exportPNG(activeFrame, layers, canvas, ps);
        download(dataUrl, "pixel-art.png");
      } else if (format === "spritesheet") {
        const dataUrl = exportSpriteSheet(frames, layers, canvas, ps);
        download(dataUrl, "sprite-sheet.png");
      } else if (format === "gif") {
        const blob = await exportGIF(frames, layers, canvas, ps, fps);
        const url = URL.createObjectURL(blob);
        download(url, "animation.gif");
        URL.revokeObjectURL(url);
      }
    } finally {
      setExporting(false);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className="pixel-panel p-6 w-80"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="text-sm font-bold mb-4"
          style={{ color: "var(--accent)" }}
        >
          导出
        </h2>

        {/* Format selection */}
        <div className="mb-4">
          <label
            className="text-xs block mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            格式
          </label>
          <div className="flex gap-1">
            {(["png", "gif", "spritesheet"] as const).map((f) => (
              <button
                key={f}
                className={`pixel-btn px-3 py-1 text-xs ${
                  format === f ? "active" : ""
                }`}
                style={{
                  background:
                    format === f ? "var(--accent)" : "var(--bg-tertiary)",
                  color:
                    format === f
                      ? "var(--bg-primary)"
                      : "var(--text-primary)",
                }}
                onClick={() => setFormat(f)}
              >
                {f === "png" ? "PNG" : f === "gif" ? "GIF" : "Sprite Sheet"}
              </button>
            ))}
          </div>
        </div>

        {/* Pixel size (scale) */}
        <div className="mb-4">
          <label
            className="text-xs block mb-1"
            style={{ color: "var(--text-secondary)" }}
          >
            缩放: {pixelSize}x
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={pixelSize}
            onChange={(e) => setPixelSize(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <button
            className="pixel-btn px-4 py-2 text-xs"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
            }}
            onClick={onClose}
          >
            取消
          </button>
          <button
            className="pixel-btn px-4 py-2 text-xs"
            style={{
              background: "var(--accent)",
              color: "var(--bg-primary)",
            }}
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? "导出中..." : "导出"}
          </button>
        </div>
      </div>
    </div>
  );
}

function download(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
