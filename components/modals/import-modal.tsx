"use client";

import { useState, useRef, useCallback } from "react";
import { usePixelStore } from "@/lib/store/pixel-store";
import { loadImage, imageToPixelGrid, quantizeColors } from "@/lib/canvas/image-processor";
import { generatePixelArt, type AIConfig } from "@/lib/canvas/ai-generator";

const PRESETS = [
  { label: "32x32", w: 32, h: 32 },
  { label: "64x64", w: 64, h: 64 },
  { label: "128x128", w: 128, h: 128 },
];

interface Props {
  onClose: () => void;
}

type TabType = "image" | "ai";

export function ImportModal({ onClose }: Props) {
  const [tab, setTab] = useState<TabType>("image");
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className="pixel-panel p-6 w-[480px] max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-sm font-bold mb-4" style={{ color: "var(--accent)" }}>
          导入像素画
        </h2>

        {/* Tab switcher */}
        <div className="flex gap-1 mb-4">
          <button
            className={`pixel-btn flex-1 px-3 py-2 text-xs ${tab === "image" ? "active" : ""}`}
            style={{
              background: tab === "image" ? "var(--accent)" : "var(--bg-tertiary)",
              color: tab === "image" ? "var(--bg-primary)" : "var(--text-primary)",
            }}
            onClick={() => setTab("image")}
          >
            🖼️ 图片导入
          </button>
          <button
            className={`pixel-btn flex-1 px-3 py-2 text-xs ${tab === "ai" ? "active" : ""}`}
            style={{
              background: tab === "ai" ? "var(--accent)" : "var(--bg-tertiary)",
              color: tab === "ai" ? "var(--bg-primary)" : "var(--text-primary)",
            }}
            onClick={() => setTab("ai")}
          >
            🤖 AI 生成
          </button>
        </div>

        {tab === "image" ? (
          <ImageImportTab fileInputRef={fileInputRef} />
        ) : (
          <AIGenerationTab />
        )}

        {/* Close button */}
        <div className="flex justify-end mt-4">
          <button
            className="pixel-btn px-4 py-2 text-xs"
            style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)" }}
            onClick={onClose}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Image Import Tab ---

function ImageImportTab({ fileInputRef }: { fileInputRef: React.RefObject<HTMLInputElement | null> }) {
  const { importPixels } = usePixelStore();
  const [selectedSize, setSelectedSize] = useState(32);
  const [doQuantize, setDoQuantize] = useState(true);
  const [quantizeStep, setQuantizeStep] = useState(32);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setProcessing(true);
    try {
      const img = await loadImage(file);
      const grid = imageToPixelGrid(img, selectedSize, selectedSize);
      const finalGrid = doQuantize
        ? { ...grid, pixels: quantizeColors(grid.pixels, quantizeStep) }
        : grid;

      importPixels(finalGrid, true);
      setPreview(URL.createObjectURL(file));
    } finally {
      setProcessing(false);
    }
  }, [selectedSize, doQuantize, quantizeStep, importPixels]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    }
  }, [handleFile]);

  return (
    <div>
      {/* Drop zone */}
      <div
        className="border-2 border-dashed p-8 text-center cursor-pointer mb-4"
        style={{ borderColor: "var(--border-color)" }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
      >
        {processing ? (
          <p style={{ color: "var(--accent)" }}>处理中...</p>
        ) : preview ? (
          <div>
            <img src={preview} className="max-w-full max-h-32 mx-auto mb-2" style={{ imageRendering: "pixelated" }} />
            <p className="text-xs" style={{ color: "var(--success)" }}>✅ 已导入到画布</p>
          </div>
        ) : (
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            拖拽图片到这里，或点击选择文件
          </p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {/* Resolution presets */}
      <div className="mb-4">
        <label className="text-xs block mb-1" style={{ color: "var(--text-secondary)" }}>
          目标分辨率
        </label>
        <div className="flex gap-1">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              className={`pixel-btn flex-1 px-2 py-1 text-xs ${selectedSize === p.w ? "active" : ""}`}
              style={{
                background: selectedSize === p.w ? "var(--accent)" : "var(--bg-tertiary)",
                color: selectedSize === p.w ? "var(--bg-primary)" : "var(--text-primary)",
              }}
              onClick={() => setSelectedSize(p.w)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quantization toggle */}
      <div className="flex items-center gap-2 mb-2">
        <input
          type="checkbox"
          checked={doQuantize}
          onChange={(e) => setDoQuantize(e.target.checked)}
        />
        <label className="text-xs" style={{ color: "var(--text-secondary)" }}>
          颜色量化（减少色板）— 步长: {quantizeStep}
        </label>
      </div>
      {doQuantize && (
        <input
          type="range"
          min={16}
          max={64}
          step={8}
          value={quantizeStep}
          onChange={(e) => setQuantizeStep(Number(e.target.value))}
          className="w-full mb-4"
        />
      )}
    </div>
  );
}

// --- AI Generation Tab ---

function AIGenerationTab() {
  const { importPixels } = usePixelStore();
  const [prompt, setPrompt] = useState("");
  const [selectedSize, setSelectedSize] = useState(32);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setError(null);
    setResult(null);

    try {
      const configStr = localStorage.getItem("pixel-studio-ai-config");
      const config: AIConfig = configStr
        ? JSON.parse(configStr)
        : { provider: "mock" as const, apiKey: "" };

      const { success, grid, error: genError } = await generatePixelArt(
        prompt,
        selectedSize,
        selectedSize,
        config
      );

      if (success && grid) {
        importPixels(grid, true);
        setResult(`✅ 已生成 ${selectedSize}x${selectedSize} 像素画`);
      } else {
        setError(genError || "生成失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      {/* Prompt input */}
      <div className="mb-4">
        <label className="text-xs block mb-1" style={{ color: "var(--text-secondary)" }}>
          描述你想要的像素画
        </label>
        <textarea
          className="w-full px-2 py-2 text-xs resize-none"
          style={{
            background: "var(--bg-primary)",
            border: "2px solid var(--border-color)",
            color: "var(--text-primary)",
            minHeight: "80px",
          }}
          placeholder="例如：一个红白相间的蘑菇，或者一把发光的剑..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      {/* Size selection */}
      <div className="mb-4">
        <label className="text-xs block mb-1" style={{ color: "var(--text-secondary)" }}>
          分辨率
        </label>
        <div className="flex gap-1">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              className={`pixel-btn flex-1 px-2 py-1 text-xs ${selectedSize === p.w ? "active" : ""}`}
              style={{
                background: selectedSize === p.w ? "var(--accent)" : "var(--bg-tertiary)",
                color: selectedSize === p.w ? "var(--bg-primary)" : "var(--text-primary)",
              }}
              onClick={() => setSelectedSize(p.w)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        className="pixel-btn w-full px-4 py-3 text-xs font-bold"
        style={{
          background: prompt.trim() ? "var(--accent)" : "var(--bg-tertiary)",
          color: prompt.trim() ? "var(--bg-primary)" : "var(--text-secondary)",
        }}
        onClick={handleGenerate}
        disabled={generating || !prompt.trim()}
      >
        {generating ? "生成中..." : "🤖 生成像素画"}
      </button>

      {/* Result / Error */}
      {result && (
        <p className="text-xs mt-3 text-center" style={{ color: "var(--success)" }}>
          {result}
        </p>
      )}
      {error && (
        <p className="text-xs mt-3 text-center" style={{ color: "var(--danger)" }}>
          ❌ {error}
        </p>
      )}

      {/* Info panel */}
      <div className="mt-4 p-2 text-xs" style={{ background: "var(--bg-primary)", color: "var(--text-secondary)" }}>
        <p>当前模式: <strong>Mock 模拟</strong></p>
        <p className="mt-1">支持的关键词：蘑菇、剑、树、花、爱心、星星、史莱姆、药水、猫、鱼、房子</p>
        <p className="mt-1">配置真实 AI → <a href="/settings" className="underline" style={{ color: "var(--accent)" }}>设置页面</a></p>
      </div>
    </div>
  );
}
