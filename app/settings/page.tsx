"use client";

import { useState } from "react";
import Link from "next/link";
import { zh } from "@/lib/i18n/zh";
import { en } from "@/lib/i18n/en";

export default function SettingsPage() {
  const [lang, setLang] = useState<"zh" | "en">("zh");
  const t = lang === "zh" ? zh : en;

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="pixel-panel p-8 w-96">
        <div className="flex items-center justify-between mb-6">
          <h1
            className="text-lg font-bold"
            style={{ color: "var(--accent)" }}
          >
            {t.settings.title}
          </h1>
          <Link
            href="/"
            className="pixel-btn px-3 py-1 text-xs"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
            }}
          >
            ← {lang === "zh" ? "返回" : "Back"}
          </Link>
        </div>

        {/* Language */}
        <div className="mb-6">
          <label
            className="text-xs block mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            {t.settings.language}
          </label>
          <div className="flex gap-2">
            <button
              className={`pixel-btn px-4 py-2 text-xs ${
                lang === "zh" ? "active" : ""
              }`}
              style={{
                background:
                  lang === "zh" ? "var(--accent)" : "var(--bg-tertiary)",
                color:
                  lang === "zh" ? "var(--bg-primary)" : "var(--text-primary)",
              }}
              onClick={() => setLang("zh")}
            >
              中文
            </button>
            <button
              className={`pixel-btn px-4 py-2 text-xs ${
                lang === "en" ? "active" : ""
              }`}
              style={{
                background:
                  lang === "en" ? "var(--accent)" : "var(--bg-tertiary)",
                color:
                  lang === "en" ? "var(--bg-primary)" : "var(--text-primary)",
              }}
              onClick={() => setLang("en")}
            >
              English
            </button>
          </div>
        </div>

        {/* Theme */}
        <div className="mb-6">
          <label
            className="text-xs block mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            {t.settings.theme}
          </label>
          <div className="flex gap-2">
            <button
              className="pixel-btn px-4 py-2 text-xs active"
              style={{
                background: "var(--accent)",
                color: "var(--bg-primary)",
              }}
            >
              MapleStory
            </button>
          </div>
        </div>

        {/* Keyboard shortcuts info */}
        <div>
          <label
            className="text-xs block mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            {t.settings.shortcuts}
          </label>
          <div
            className="text-xs space-y-1"
            style={{ color: "var(--text-secondary)" }}
          >
            <p>Ctrl+Z — {lang === "zh" ? "撤销" : "Undo"}</p>
            <p>Ctrl+Y — {lang === "zh" ? "重做" : "Redo"}</p>
            <p>Ctrl+S — {lang === "zh" ? "保存" : "Save"}</p>
            <p>Space+拖拽 — {lang === "zh" ? "平移画布" : "Pan canvas"}</p>
            <p>滚轮 — {lang === "zh" ? "缩放" : "Zoom"}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
