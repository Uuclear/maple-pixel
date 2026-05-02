"use client";

import { useState } from "react";
import { usePixelStore } from "@/lib/store/pixel-store";

const presets = [
  { label: "32x32", w: 32, h: 32 },
  { label: "64x64", w: 64, h: 64 },
  { label: "96x96", w: 96, h: 96 },
  { label: "128x128", w: 128, h: 128 },
  { label: "256x256", w: 256, h: 256 },
];

interface Props {
  onClose: () => void;
}

export function NewCanvasModal({ onClose }: Props) {
  const { setCanvasSize } = usePixelStore();
  const [width, setWidth] = useState(64);
  const [height, setHeight] = useState(64);

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
          新建画布
        </h2>

        {/* Presets */}
        <div className="mb-4">
          <label
            className="text-xs block mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            预设尺寸
          </label>
          <div className="flex flex-wrap gap-1">
            {presets.map((p) => (
              <button
                key={p.label}
                className="pixel-btn px-2 py-1 text-xs"
                style={{
                  background:
                    width === p.w && height === p.h
                      ? "var(--accent)"
                      : "var(--bg-tertiary)",
                  color:
                    width === p.w && height === p.h
                      ? "var(--bg-primary)"
                      : "var(--text-primary)",
                }}
                onClick={() => {
                  setWidth(p.w);
                  setHeight(p.h);
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom size */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <label className="text-xs block mb-1" style={{ color: "var(--text-secondary)" }}>宽</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full px-2 py-1 text-xs"
              style={{
                background: "var(--bg-primary)",
                border: "2px solid var(--border-color)",
                color: "var(--text-primary)",
              }}
              min={1}
              max={512}
            />
          </div>
          <div className="flex-1">
            <label className="text-xs block mb-1" style={{ color: "var(--text-secondary)" }}>高</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full px-2 py-1 text-xs"
              style={{
                background: "var(--bg-primary)",
                border: "2px solid var(--border-color)",
                color: "var(--text-primary)",
              }}
              min={1}
              max={512}
            />
          </div>
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
            onClick={() => {
              setCanvasSize(width, height);
              onClose();
            }}
          >
            创建
          </button>
        </div>
      </div>
    </div>
  );
}
