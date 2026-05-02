"use client";

import { usePixelStore } from "@/lib/store/pixel-store";
import { useState } from "react";

export interface HeaderActions {
  onNew: () => void;
  onImport: () => void;
  onExport: () => void;
  onLangToggle: () => void;
}

export function Header({ onNew, onImport, onExport, onLangToggle }: HeaderActions) {
  const { canvas, frames } = usePixelStore();
  const [lang, setLang] = useState<"zh" | "en">("zh");

  const t = lang === "zh"
    ? { newCanvas: "新建", import_: "导入", export: "导出", zh: "中文", en: "EN" }
    : { newCanvas: "New", import_: "Import", export: "Export", zh: "中文", en: "EN" };

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
          onClick={onNew}
        >
          {t.newCanvas}
        </button>
        <button
          className="pixel-btn px-3 py-1"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-primary)",
          }}
          onClick={onImport}
        >
          {t.import_}
        </button>
        <button
          className="pixel-btn px-3 py-1"
          style={{
            background: "var(--accent)",
            color: "var(--bg-primary)",
          }}
          onClick={onExport}
        >
          {t.export}
        </button>
        <button
          className="pixel-btn px-3 py-1"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-primary)",
          }}
          onClick={() => {
            const newLang = lang === "zh" ? "en" : "zh";
            setLang(newLang);
            onLangToggle();
          }}
        >
          {lang === "zh" ? t.zh : t.en}
        </button>
      </div>
    </header>
  );
}
