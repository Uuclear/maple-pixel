"use client";

import { useState } from "react";

const categories = [
  { id: "items", label: "物品", icon: "📦" },
  { id: "mobs", label: "怪物", icon: "👾" },
  { id: "npcs", label: "NPC", icon: "🧑" },
  { id: "maps", label: "地图", icon: "🗺️" },
];

export function ResourceBrowser() {
  const [activeCategory, setActiveCategory] = useState("items");

  return (
    <div className="h-full flex flex-col">
      <div
        className="p-2 text-xs font-bold"
        style={{
          borderBottom: "2px solid var(--border-color)",
          color: "var(--accent)",
        }}
      >
        资源浏览器
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 p-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`pixel-btn px-2 py-1 text-xs ${
              activeCategory === cat.id ? "active" : ""
            }`}
            style={{
              background:
                activeCategory === cat.id
                  ? "var(--accent)"
                  : "var(--bg-tertiary)",
              color:
                activeCategory === cat.id
                  ? "var(--bg-primary)"
                  : "var(--text-primary)",
            }}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="px-2 pb-2">
        <input
          type="text"
          placeholder="搜索资源..."
          className="w-full px-2 py-1 text-xs"
          style={{
            background: "var(--bg-primary)",
            border: "2px solid var(--border-color)",
            color: "var(--text-primary)",
            outline: "none",
          }}
        />
      </div>

      {/* Resource grid placeholder */}
      <div className="flex-1 flex items-center justify-center p-4">
        <p
          className="text-xs text-center"
          style={{ color: "var(--text-secondary)" }}
        >
          连接 maplestory.io API 后显示资源
        </p>
      </div>
    </div>
  );
}
