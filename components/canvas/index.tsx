"use client";

import { PixelCanvas } from "./pixel-canvas";
import { usePixelStore } from "@/lib/store/pixel-store";
import { useEffect, useRef } from "react";

export function CanvasContainer() {
  const { zoom, setZoom, toggleGrid, showGrid } = usePixelStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.5 : 0.5;
      setZoom(Math.max(0.5, Math.min(32, zoom + delta)));
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [zoom, setZoom]);

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      <PixelCanvas />
      {/* Zoom indicator */}
      <div
        className="absolute bottom-2 right-2 px-2 py-1 text-xs"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          color: "var(--text-secondary)",
        }}
      >
        {Math.round(zoom * 100)}%
      </div>
      {/* Grid toggle button */}
      <button
        className="absolute bottom-2 left-2 px-2 py-1 text-xs pixel-btn"
        style={{
          background: showGrid ? "var(--accent)" : "var(--bg-tertiary)",
          color: showGrid ? "var(--bg-primary)" : "var(--text-primary)",
        }}
        onClick={toggleGrid}
      >
        Grid
      </button>
    </div>
  );
}
