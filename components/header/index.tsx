"use client";

import { usePixelStore } from "@/lib/store/pixel-store";
import { useState } from "react";
import { NewCanvasModal } from "@/components/modals/new-canvas-modal";
import { ExportModal } from "@/components/modals/export-modal";

export function Header() {
  const { canvas, frames } = usePixelStore();
  const [lang, setLang] = useState<"zh" | "en">("zh");
  const [showNewCanvas, setShowNewCanvas] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const t = lang === "zh"
    ? { newCanvas: "新建", export: "导出", settings: "设置", zh: "中文", en: "EN" }
    : { newCanvas: "New", export: "Export", settings: "Settings", zh: "中文", en: "EN" };

  return (
    <header
      className="flex items-center justify-between px-4 h-12 shrink-0"
      style={{
        background: "var(--bg-secondary)",
        borderBottom: "2px solid var(--border-color)",
      }}
    >
      <div className="flex items-center gap-4">
        <span style={{ color: "var(--accent)" }} className="text-sm font-bold">
          Pixel Studio
        </span>
        <span style={{ color: "var(--text-secondary)" }}>
          {canvas.width}x{canvas.height}
        </span>
        <span style={{ color: "var(--text-secondary)" }}>
          {frames.length}F
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="pixel-btn px-3 py-1"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-primary)",
          }}
          onClick={() => setShowNewCanvas(true)}
        >
          {t.newCanvas}
        </button>
        <button
          className="pixel-btn px-3 py-1"
          style={{
            background: "var(--accent)",
            color: "var(--bg-primary)",
          }}
          onClick={() => setShowExport(true)}
        >
          {t.export}
        </button>
        <button
          className="pixel-btn px-3 py-1"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-primary)",
          }}
          onClick={() => setLang(lang === "zh" ? "en" : "zh")}
        >
          {lang === "zh" ? t.zh : t.en}
        </button>
      </div>
      {showNewCanvas && <NewCanvasModal onClose={() => setShowNewCanvas(false)} />}
      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </header>
  );
}
