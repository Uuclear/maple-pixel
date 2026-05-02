"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { SidebarLeft } from "@/components/sidebar-left";
import { SidebarRight } from "@/components/sidebar-right";
import { CanvasContainer } from "@/components/canvas";
import { Timeline } from "@/components/timeline";
import { NewCanvasModal } from "@/components/modals/new-canvas-modal";
import { ExportModal } from "@/components/modals/export-modal";
import { ImportModal } from "@/components/modals/import-modal";
import { usePixelStore } from "@/lib/store/pixel-store";

export default function CanvasPage() {
  const { undo, redo } = usePixelStore();
  const [showNewCanvas, setShowNewCanvas] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [lang, setLang] = useState<"zh" | "en">("zh");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          undo();
        }
        if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
          e.preventDefault();
          redo();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return (
    <div
      className="h-screen flex flex-col overflow-hidden relative"
      style={{ background: "var(--bg-primary)" }}
    >
      <Header
        onNew={() => setShowNewCanvas(true)}
        onImport={() => setShowImport(true)}
        onExport={() => setShowExport(true)}
        onLangToggle={() => setLang((l) => (l === "zh" ? "en" : "zh"))}
      />
      <div className="flex flex-1 overflow-hidden">
        <SidebarLeft />
        <CanvasContainer />
        <SidebarRight />
      </div>
      <Timeline />
      {showNewCanvas && <NewCanvasModal onClose={() => setShowNewCanvas(false)} />}
      {showImport && <ImportModal onClose={() => setShowImport(false)} />}
      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </div>
  );
}
