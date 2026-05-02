"use client";

import { Header } from "@/components/header";
import { SidebarLeft } from "@/components/sidebar-left";
import { SidebarRight } from "@/components/sidebar-right";
import { CanvasContainer } from "@/components/canvas";
import { Timeline } from "@/components/timeline";
import { useEffect } from "react";
import { usePixelStore } from "@/lib/store/pixel-store";

export default function CanvasPage() {
  const { undo, redo } = usePixelStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
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
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <SidebarLeft />
        <CanvasContainer />
        <SidebarRight />
      </div>
      <Timeline />
    </div>
  );
}
