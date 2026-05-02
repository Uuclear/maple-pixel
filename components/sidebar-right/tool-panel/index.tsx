"use client";

import { usePixelStore } from "@/lib/store/pixel-store";
import type { ToolType } from "@/lib/types";

const tools: { id: ToolType; label: string; icon: string }[] = [
  { id: "pencil", label: "铅笔", icon: "✏️" },
  { id: "eraser", label: "橡皮", icon: "🧹" },
  { id: "fill", label: "填充", icon: "🪣" },
  { id: "eyedropper", label: "取色", icon: "💉" },
];

export function ToolPanel() {
  const { currentTool, setCurrentTool } = usePixelStore();

  return (
    <div className="pixel-panel p-2">
      <div
        className="text-xs font-bold mb-2"
        style={{ color: "var(--accent)" }}
      >
        工具
      </div>
      <div className="grid grid-cols-2 gap-1">
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={`pixel-btn px-2 py-2 text-xs ${
              currentTool === tool.id ? "active" : ""
            }`}
            style={{
              background:
                currentTool === tool.id
                  ? "var(--accent)"
                  : "var(--bg-tertiary)",
              color:
                currentTool === tool.id
                  ? "var(--bg-primary)"
                  : "var(--text-primary)",
            }}
            onClick={() => setCurrentTool(tool.id)}
            title={tool.label}
          >
            {tool.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
