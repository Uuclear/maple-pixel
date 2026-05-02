"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { zh } from "@/lib/i18n/zh";
import { en } from "@/lib/i18n/en";

export default function SettingsPage() {
  const [lang, setLang] = useState<"zh" | "en">("zh");
  const t = lang === "zh" ? zh : en;

  // AI config state
  const [aiProvider, setAiProvider] = useState<"mock" | "openai" | "anthropic" | "dashscope">("mock");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [saved, setSaved] = useState(false);

  // Load saved config
  useEffect(() => {
    const configStr = localStorage.getItem("pixel-studio-ai-config");
    if (configStr) {
      try {
        const config = JSON.parse(configStr);
        setAiProvider(config.provider || "mock");
        setApiKey(config.apiKey || "");
        setModel(config.model || "");
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const handleSaveConfig = () => {
    localStorage.setItem("pixel-studio-ai-config", JSON.stringify({
      provider: aiProvider,
      apiKey,
      model,
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const providerNames = {
    mock: "Mock 模拟",
    openai: "OpenAI (GPT)",
    anthropic: "Claude (Anthropic)",
    dashscope: "通义千问 (DashScope)",
  };

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

        {/* AI Provider */}
        <div className="mb-6">
          <label
            className="text-xs block mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            {t.settings.aiProvider}
          </label>
          <div className="flex gap-1 mb-2">
            {(["mock", "openai", "anthropic", "dashscope"] as const).map((p) => (
              <button
                key={p}
                className={`pixel-btn flex-1 px-2 py-1 text-xs ${aiProvider === p ? "active" : ""}`}
                style={{
                  background: aiProvider === p ? "var(--accent)" : "var(--bg-tertiary)",
                  color: aiProvider === p ? "var(--bg-primary)" : "var(--text-primary)",
                }}
                onClick={() => setAiProvider(p)}
              >
                {p === "mock" ? "Mock" : p === "openai" ? "GPT" : p === "anthropic" ? "Claude" : "Qwen"}
              </button>
            ))}
          </div>

          {aiProvider !== "mock" && (
            <div className="space-y-2">
              <input
                type="password"
                placeholder={t.settings.apiKey}
                className="w-full px-2 py-1 text-xs"
                style={{
                  background: "var(--bg-primary)",
                  border: "2px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <input
                type="text"
                placeholder={t.settings.model}
                className="w-full px-2 py-1 text-xs"
                style={{
                  background: "var(--bg-primary)",
                  border: "2px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
              <button
                className="pixel-btn w-full px-4 py-2 text-xs"
                style={{ background: "var(--success)", color: "#fff" }}
                onClick={handleSaveConfig}
              >
                {saved ? "✅ 已保存" : "💾 保存配置"}
              </button>
            </div>
          )}
          <p className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>
            {t.settings.aiConfigHint}
          </p>
          {aiProvider !== "mock" && (
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              {lang === "zh" ? "当前配置: " : "Config: "}{providerNames[aiProvider]}
              {apiKey ? ` (${apiKey.slice(0, 6)}...)` : ` — ${lang === "zh" ? "未配置 API Key" : "API Key not set"}`}
            </p>
          )}
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
