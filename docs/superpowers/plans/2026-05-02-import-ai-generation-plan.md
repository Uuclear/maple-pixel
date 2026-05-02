# 图片转像素画 + AI 生成功能 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 添加两个核心功能：(1) 上传图片自动降采样为像素画 (2) AI 文字描述生成像素画（mock + 可配置真实 API）

**Architecture:** 新增 Modal 组件处理图片上传/AI 输入，通过 `lib/canvas/image-processor.ts` 实现图片降采样和 AI 生成逻辑，写入 Zustand store 的当前图层。

**Tech Stack:** Next.js, Zustand, HTML Canvas (ImageData), 可配置 AI API（Claude/OpenAI/通义千问）

---

## 文件变更概览

| 文件 | 操作 | 说明 |
|------|------|------|
| `lib/canvas/image-processor.ts` | **新建** | 图片降采样算法、颜色量化 |
| `lib/canvas/ai-generator.ts` | **新建** | AI 生成逻辑（mock + 真实 API 代理） |
| `components/modals/import-modal.tsx` | **新建** | 图片导入 + AI 生成的 UI 弹窗 |
| `components/header/index.tsx` | **修改** | 添加"导入"按钮打开 ImportModal |
| `lib/i18n/zh.ts` | **修改** | 添加导入/AI 相关翻译 |
| `lib/i18n/en.ts` | **修改** | 添加导入/AI 相关翻译 |
| `lib/types.ts` | **修改** | 添加 AI 配置类型 |
| `app/settings/page.tsx` | **修改** | 添加 AI API Key 配置 |
| `lib/store/pixel-store.ts` | **修改** | 添加 `importPixels` 方法 |

---

### Task 1: 图片降采样引擎

**Files:**
- Create: `lib/canvas/image-processor.ts`

- [ ] **Step 1: Create lib/canvas/image-processor.ts**

```typescript
/**
 * Image processing utilities for converting photos to pixel art.
 */

export interface PixelGrid {
  width: number;
  height: number;
  pixels: string[][]; // pixels[y][x] = "#RRGGBB" or "transparent"
}

/**
 * Load an image from File or URL into an HTMLImageElement.
 */
export function loadImage(source: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;

    if (source instanceof File) {
      img.src = URL.createObjectURL(source);
    } else {
      img.src = source;
    }
  });
}

/**
 * Downsample an image to the target grid size.
 * 
 * Algorithm:
 * 1. Draw image onto offscreen canvas at target resolution
 * 2. Read pixel data with getImageData
 * 3. Each pixel becomes the average color of the source region
 */
export function imageToPixelGrid(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number
): PixelGrid {
  const offscreen = document.createElement("canvas");
  offscreen.width = targetWidth;
  offscreen.height = targetHeight;
  const ctx = offscreen.getContext("2d")!;

  // Use imageSmoothingEnabled=false for blocky pixel art style
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const data = imageData.data;

  const pixels: string[][] = [];
  for (let y = 0; y < targetHeight; y++) {
    const row: string[] = [];
    for (let x = 0; x < targetWidth; x++) {
      const i = (y * targetWidth + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a < 128) {
        row.push("transparent");
      } else {
        row.push(`#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`);
      }
    }
    pixels.push(row);
  }

  return { width: targetWidth, height: targetHeight, pixels };
}

/**
 * Quantize colors to reduce palette (optional post-processing step).
 * Rounds each RGB channel to nearest multiple of step.
 * E.g., step=32 maps 0-31→0, 32-63→32, 64-95→64, etc.
 */
export function quantizeColors(pixels: string[][], step: number = 32): string[][] {
  return pixels.map((row) =>
    row.map((color) => {
      if (color === "transparent") return color;
      const hex = color.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      const qr = Math.round(r / step) * step;
      const qg = Math.round(g / step) * step;
      const qb = Math.round(b / step) * step;

      return `#${qr.toString(16).padStart(2, "0")}${qg.toString(16).padStart(2, "0")}${qb.toString(16).padStart(2, "0")}`;
    })
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/canvas/image-processor.ts
git commit -m "feat: add image processing for photo-to-pixel-art conversion"
```

---

### Task 2: AI Generator Engine

**Files:**
- Create: `lib/canvas/ai-generator.ts`

- [ ] **Step 1: Create lib/canvas/ai-generator.ts**

```typescript
import type { PixelGrid } from "@/lib/canvas/image-processor";

export interface AIConfig {
  provider: "mock" | "openai" | "anthropic" | "dashscope";
  apiKey: string;
  model?: string;
}

export interface GenerationResult {
  success: boolean;
  grid?: PixelGrid;
  error?: string;
}

/**
 * Generate pixel art from text description.
 */
export async function generatePixelArt(
  prompt: string,
  width: number,
  height: number,
  config: AIConfig
): Promise<GenerationResult> {
  if (config.provider === "mock") {
    return generateMockArt(prompt, width, height);
  }

  const systemPrompt = `You are a pixel art generator. Given a description, output a JSON object with pixel art data.

Rules:
- Output ONLY valid JSON, no other text
- Use hex colors like "#RRGGBB" or "transparent"
- The grid must be exactly ${width}x${height}
- Each element in the "pixels" array is a row (array of colors)

Example output for a 4x4 red square:
{
  "width": 4,
  "height": 4,
  "pixels": [
    ["transparent", "transparent", "transparent", "transparent"],
    ["transparent", "#E83030", "#E83030", "transparent"],
    ["transparent", "#E83030", "#E83030", "transparent"],
    ["transparent", "transparent", "transparent", "transparent"]
  ]
}`;

  const userPrompt = `Create a ${width}x${height} pixel art of: ${prompt}`;

  try {
    let content: string;

    if (config.provider === "openai") {
      content = await callOpenAI(systemPrompt, userPrompt, config);
    } else if (config.provider === "anthropic") {
      content = await callAnthropic(systemPrompt, userPrompt, config);
    } else if (config.provider === "dashscope") {
      content = await callDashScope(systemPrompt, userPrompt, config);
    } else {
      return { success: false, error: "Unknown AI provider" };
    }

    // Parse JSON from AI response
    const jsonStr = content.match(/\{[\s\S]*\}/)?.[0];
    if (!jsonStr) {
      return { success: false, error: "AI did return valid JSON" };
    }

    const parsed = JSON.parse(jsonStr);
    if (!parsed.pixels || !Array.isArray(parsed.pixels)) {
      return { success: false, error: "AI returned invalid pixel data" };
    }

    const grid: PixelGrid = {
      width: parsed.width || width,
      height: parsed.height || height,
      pixels: parsed.pixels,
    };

    return { success: true, grid };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "AI generation failed",
    };
  }
}

/**
 * Mock AI generator — creates simple patterns based on keywords.
 */
function generateMockArt(
  prompt: string,
  width: number,
  height: number
): Promise<GenerationResult> {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      const p = prompt.toLowerCase();
      const pixels: string[][] = [];

      for (let y = 0; y < height; y++) {
        const row: string[] = [];
        for (let x = 0; x < width; x++) {
          if (p.includes("heart") || p.includes("love")) {
            row.push(isHeart(x, y, width, height) ? "#E83030" : "transparent");
          } else if (p.includes("star")) {
            row.push(isStar(x, y, width, height) ? "#FFD700" : "transparent");
          } else if (p.includes("mushroom") || p.includes("蘑菇")) {
            row.push(getMushroomColor(x, y, width, height));
          } else if (p.includes("tree") || p.includes("树")) {
            row.push(getTreeColor(x, y, width, height));
          } else if (p.includes("sword") || p.includes("剑")) {
            row.push(getSwordColor(x, y, width, height));
          } else if (p.includes("potion") || p.includes("药") || p.includes("瓶")) {
            row.push(getPotionColor(x, y, width, height));
          } else if (p.includes("flower") || p.includes("花")) {
            row.push(getFlowerColor(x, y, width, height));
          } else if (p.includes("slime") || p.includes("史莱姆")) {
            row.push(getSlimeColor(x, y, width, height));
          } else {
            // Default: simple circle
            row.push(isCircle(x, y, width, height) ? "#3B82F6" : "transparent");
          }
        }
        pixels.push(row);
      }

      resolve({
        success: true,
        grid: { width, height, pixels },
      });
    }, 1500);
  });
}

// --- Mock pattern helpers ---

function isHeart(x: number, y: number, w: number, h: number): boolean {
  const cx = x / w - 0.5;
  const cy = y / h - 0.5;
  const s = 8 / Math.min(w, h);
  const nx = cx / s;
  const ny = cy / s;
  // Approximate heart shape
  const a = nx * nx + (ny - Math.abs(nx) * 0.5) * (ny - Math.abs(nx) * 0.5);
  return a < 0.15 && ny > -0.2;
}

function isCircle(x: number, y: number, w: number, h: number): boolean {
  const cx = (x / w - 0.5) ** 2;
  const cy = (y / h - 0.5) ** 2;
  return cx + cy < 0.15;
}

function isStar(x: number, y: number, w: number, h: number): boolean {
  const cx = x / w - 0.5;
  const cy = y / h - 0.5;
  const angle = Math.atan2(cy, cx);
  const dist = Math.sqrt(cx * cx + cy * cy);
  const points = 5;
  const star = 0.5 + 0.5 * Math.cos(points * angle);
  return dist < star * 0.15;
}

function getMushroomColor(x: number, y: number, w: number, h: number): string {
  const mid = Math.floor(w / 2);
  const top = y < h * 0.45;
  if (top) {
    // Red cap
    if (y < h * 0.25) return "transparent";
    const dx = Math.abs(x - mid);
    if (dx > w * 0.35) return "transparent";
    // White spots
    const spots = [(mid - 2, Math.floor(h * 0.3)), (mid + 2, Math.floor(h * 0.35)), (mid, Math.floor(h * 0.25))];
    for (const [sx, sy] of spots) {
      if (Math.abs(x - sx) <= 1 && Math.abs(y - sy) <= 1) return "#FFFFFF";
    }
    return "#E83030";
  } else if (y < h * 0.65) {
    // White stem
    const dx = Math.abs(x - mid);
    if (dx > w * 0.15) return "transparent";
    return "#F5DEB3";
  }
  return "transparent";
}

function getTreeColor(x: number, y: number, w: number, h: number): string {
  const mid = Math.floor(w / 2);
  if (y < h * 0.6) {
    // Green canopy (triangle-ish)
    const spread = (h * 0.6 - y) / (h * 0.6) * w * 0.4;
    if (Math.abs(x - mid) > spread) return "transparent";
    return "#22C55E";
  } else if (y < h * 0.9) {
    // Brown trunk
    if (Math.abs(x - mid) > 1) return "transparent";
    return "#8B4513";
  }
  return "transparent";
}

function getSwordColor(x: number, y: number, w: number, h: number): string {
  const progress = y / h;
  if (progress < 0.1 || progress > 0.9) return "transparent";
  if (progress < 0.7) {
    // Blade
    if (Math.abs(x - w / 2) > 1) return "transparent";
    return "#D1D5DB";
  } else if (progress < 0.75) {
    // Guard
    if (Math.abs(x - w / 2) > 3) return "transparent";
    return "#F59E0B";
  } else {
    // Handle
    if (Math.abs(x - w / 2) > 1) return "transparent";
    return "#8B4513";
  }
}

function getPotionColor(x: number, y: number, w: number, h: number): string {
  const mid = Math.floor(w / 2);
  if (y < h * 0.15 || y > h * 0.9) return "transparent";
  const body = y > h * 0.25 && y < h * 0.85;
  const dx = Math.abs(x - mid);
  const width = body ? 3 : 1;
  if (dx > width) return "transparent";
  return y < h * 0.55 ? "#3B82F6" : "#1E40AF";
}

function getFlowerColor(x: number, y: number, w: number, h: number): string {
  const mid = Math.floor(w / 2);
  const dx = Math.abs(x - mid);
  if (y < h * 0.3) {
    // Petals
    const petalRadius = Math.floor(w * 0.25);
    const dist = Math.sqrt((x - mid) ** 2 + (y - h * 0.15) ** 2);
    if (dist > petalRadius) return "transparent";
    return dist < 1 ? "#F59E0B" : "#FF6B6B";
  } else if (y < h * 0.9) {
    // Stem
    if (dx > 1) return "transparent";
    return "#22C55E";
  }
  return "transparent";
}

function getSlimeColor(x: number, y: number, w: number, h: number): string {
  const mid = Math.floor(w / 2);
  const cy = Math.floor(h * 0.5);
  const dist = Math.sqrt(((x - mid) / (w * 0.35)) ** 2 + ((y - cy) / (h * 0.4)) ** 2);
  if (dist > 1) return "transparent";
  // Eyes
  if ((x === mid - 2 || x === mid + 2) && y === cy - 1) return "#000000";
  return "#93C5FD";
}

// --- Real API callers ---

async function callOpenAI(
  system: string,
  user: string,
  config: AIConfig
): Promise<string> {
  const model = config.model || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

async function callAnthropic(
  system: string,
  user: string,
  config: AIConfig
): Promise<string> {
  const model = config.model || "claude-3-5-sonnet-20241022";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.content[0].text;
}

async function callDashScope(
  system: string,
  user: string,
  config: AIConfig
): Promise<string> {
  const model = config.model || "qwen-plus";
  const res = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DashScope API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/canvas/ai-generator.ts
git commit -m "feat: add AI pixel art generator (mock + OpenAI/Anthropic/DashScope)"
```

---

### Task 3: Store Integration

**Files:**
- Modify: `lib/types.ts`
- Modify: `lib/store/pixel-store.ts`

- [ ] **Step 1: Update lib/types.ts** — Add `importPixels` to PixelState interface

Add to the `PixelState` interface:

```typescript
// ... existing interface ...

  // Pixels
  setPixel: (x: number, y: number, color: string) => void;
  clearPixel: (x: number, y: number) => void;
  floodFill: (x: number, y: number, color: string) => void;
  clearLayer: () => void;
  importPixels: (grid: PixelGrid, center?: boolean) => void;
```

Also add import for PixelGrid at the top:

```typescript
import type { PixelGrid } from "@/lib/canvas/image-processor";
```

- [ ] **Step 2: Update lib/store/pixel-store.ts** — Add `importPixels` method

Add to the store implementation (after `clearLayer`):

```typescript
import { type PixelGrid } from "@/lib/canvas/image-processor";

// ... inside the create callback ...

    importPixels: (grid: PixelGrid, center: boolean = true) =>
      set((state) => {
        const layer = state.layers.find((l) => l.id === state.activeLayerId);
        if (!layer || layer.locked) return state;

        const offsetX = center
          ? Math.floor((state.canvas.width - grid.width) / 2)
          : 0;
        const offsetY = center
          ? Math.floor((state.canvas.height - grid.height) / 2)
          : 0;

        // Snapshot for undo
        const snap = snapshotLayers(state.layers);
        const cmd: Command = {
          execute: () => {},
          undo: () => {
            set((s) => ({
              layers: restoreLayersFromSnapshot(s.layers, snap),
              canUndo: history.canUndo,
              canRedo: history.canRedo,
            }));
          },
        };
        history.push(cmd);

        const newPixels = new Map(layer.pixels);
        for (let y = 0; y < grid.height; y++) {
          for (let x = 0; x < grid.width; x++) {
            const color = grid.pixels[y]?.[x];
            if (!color || color === "transparent") continue;
            const px = x + offsetX;
            const py = y + offsetY;
            if (px >= 0 && px < state.canvas.width && py >= 0 && py < state.canvas.height) {
              newPixels.set(`${px},${py}`, color);
            }
          }
        }

        return {
          layers: state.layers.map((l) =>
            l.id === state.activeLayerId ? { ...l, pixels: newPixels } : l
          ),
          canUndo: history.canUndo,
          canRedo: history.canRedo,
        };
      }),
```

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts lib/store/pixel-store.ts
git commit -m "feat: add importPixels store method for AI and image import"
```

---

### Task 4: Import Modal UI

**Files:**
- Create: `components/modals/import-modal.tsx`
- Modify: `components/header/index.tsx`

- [ ] **Step 1: Create components/modals/import-modal.tsx**

```tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { usePixelStore } from "@/lib/store/pixel-store";
import { loadImage, imageToPixelGrid, quantizeColors, type PixelGrid } from "@/lib/canvas/image-processor";
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
  const { importPixels, canvas } = usePixelStore();
  const [selectedSize, setSelectedSize] = useState(32);
  const [quantize, setQuantize] = useState(true);
  const [quantizeStep, setQuantizeStep] = useState(32);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setProcessing(true);
    try {
      const img = await loadImage(file);
      const grid = imageToPixelGrid(img, selectedSize, selectedSize);
      const finalGrid = quantize
        ? { ...grid, pixels: quantizeColors(grid.pixels, quantizeStep) }
        : grid;

      importPixels(finalGrid, true);
      // Show preview
      setPreview(URL.createObjectURL(file));
    } finally {
      setProcessing(false);
    }
  }, [selectedSize, quantize, quantizeStep, importPixels]);

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

      {/* Settings */}
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

      <div className="flex items-center gap-2 mb-2">
        <input
          type="checkbox"
          checked={quantize}
          onChange={(e) => setQuantize(e.target.checked)}
        />
        <label className="text-xs" style={{ color: "var(--text-secondary)" }}>
          颜色量化（减少色板）— 步长: {quantizeStep}
        </label>
      </div>
      {quantize && (
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
  const { importPixels, canvas } = usePixelStore();
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
      // Read config from localStorage
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

      {/* AI provider info */}
      <div className="mt-4 p-2 text-xs" style={{ background: "var(--bg-primary)", color: "var(--text-secondary)" }}>
        <p>当前模式: <strong>Mock 模拟</strong></p>
        <p className="mt-1">支持的关键词：蘑菇、剑、树、花、爱心、星星、史莱姆、药水</p>
        <p className="mt-1">配置真实 AI API → <a href="/settings" className="underline" style={{ color: "var(--accent)" }}>设置页面</a></p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update components/header/index.tsx** — Add "导入" button

Add to the header buttons section (between "新建" and "导出"):

```tsx
<button
  className="pixel-btn px-3 py-1"
  style={{
    background: "var(--bg-tertiary)",
    color: "var(--text-primary)",
  }}
  onClick={() => setShowImport(true)}
>
  {t.import_}
</button>
```

And add state + modal:

```tsx
const [showImport, setShowImport] = useState(false);
```

In the `t` object:
```typescript
const t = lang === "zh"
  ? { newCanvas: "新建", import_: "导入", export: "导出", zh: "中文", en: "EN" }
  : { newCanvas: "New", import_: "Import", export: "Export", zh: "中文", en: "EN" };
```

And at the bottom:
```tsx
{showImport && <ImportModal onClose={() => setShowImport(false)} />}
```

Add import:
```tsx
import { ImportModal } from "@/components/modals/import-modal";
```

- [ ] **Step 3: Commit**

```bash
git add components/modals/import-modal.tsx components/header/index.tsx
git commit -m "feat: add import modal with image upload and AI generation tabs"
```

---

### Task 5: AI Config in Settings + i18n

**Files:**
- Modify: `lib/i18n/zh.ts`
- Modify: `lib/i18n/en.ts`
- Modify: `app/settings/page.tsx`

- [ ] **Step 1: Update lib/i18n/zh.ts** — Add AI-related translations

Add to `zh.settings`:

```typescript
settings: {
  // ... existing ...
  aiProvider: "AI 提供商",
  apiKey: "API Key",
  model: "模型",
  aiConfigHint: "配置后将使用真实 AI 而非模拟数据",
},
```

- [ ] **Step 2: Update lib/i18n/en.ts** — Add AI-related translations

Add to `en.settings`:

```typescript
settings: {
  // ... existing ...
  aiProvider: "AI Provider",
  apiKey: "API Key",
  model: "Model",
  aiConfigHint: "Configured AI will be used instead of mock data",
},
```

- [ ] **Step 3: Update app/settings/page.tsx** — Add AI configuration section

Add after the theme section:

```tsx
{/* AI Provider */}
<div className="mb-6">
  <label className="text-xs block mb-2" style={{ color: "var(--text-secondary)" }}>
    {t.settings.aiProvider}
  </label>
  <div className="flex gap-2 mb-2">
    {(["mock", "openai", "anthropic", "dashscope"] as const).map((p) => (
      <button
        key={p}
        className={`pixel-btn px-3 py-1 text-xs ${aiProvider === p ? "active" : ""}`}
        style={{
          background: aiProvider === p ? "var(--accent)" : "var(--bg-tertiary)",
          color: aiProvider === p ? "var(--bg-primary)" : "var(--text-primary)",
        }}
        onClick={() => setAiProvider(p)}
      >
        {p === "mock" ? "Mock" : p === "openai" ? "OpenAI" : p === "anthropic" ? "Claude" : "通义千问"}
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
        className="pixel-btn px-4 py-2 text-xs"
        style={{ background: "var(--success)", color: "#fff" }}
        onClick={() => {
          localStorage.setItem("pixel-studio-ai-config", JSON.stringify({
            provider: aiProvider,
            apiKey,
            model,
          }));
        }}
      >
        保存配置
      </button>
    </div>
  )}
  <p className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>
    {t.settings.aiConfigHint}
  </p>
</div>
```

Add state variables at the top of the component:

```tsx
const [aiProvider, setAiProvider] = useState<"mock" | "openai" | "anthropic" | "dashscope">("mock");
const [apiKey, setApiKey] = useState("");
const [model, setModel] = useState("");
```

- [ ] **Step 4: Commit**

```bash
git add lib/i18n/zh.ts lib/i18n/en.ts app/settings/page.tsx
git commit -m "feat: add AI provider configuration to settings page"
```

---

### Task 6: Final Verification

- [ ] **Step 1: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Dev server test**

Open http://localhost:3000/canvas:
1. Click "导入" → modal opens
2. Image tab: drop an image → pixel art appears on canvas
3. AI tab: type "蘑菇" → click generate → pixel art appears
4. Settings page: configure AI provider → save → test AI generation

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: complete image import and AI pixel art generation"
```
