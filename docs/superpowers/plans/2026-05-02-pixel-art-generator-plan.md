# Pixel Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a MapleStory-inspired pixel art editor web app with canvas drawing, multi-layer editing, frame animation timeline, and adventure resource browser.

**Architecture:** Next.js 15 App Router with HTML Canvas 2D rendering engine, Zustand state management, SWR for API caching, Tailwind CSS + custom CSS Variables for MapleStory pixel-theme UI.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Zustand, SWR, gifenc, next-intl, Canvas 2D API

---

## File Structure Overview

All new files created:

| File | Responsibility |
|------|---------------|
| `package.json` | Dependencies and scripts |
| `next.config.ts` | Next.js config with next-intl plugin |
| `tsconfig.json` | TypeScript configuration |
| `tailwind.config.ts` | Tailwind CSS config |
| `postcss.config.mjs` | PostCSS config |
| `app/layout.tsx` | Root layout with providers |
| `app/page.tsx` | Landing page |
| `app/canvas/page.tsx` | Canvas workspace page |
| `app/settings/page.tsx` | Settings page |
| `components/header/index.tsx` | Top navigation bar |
| `components/sidebar-left/index.tsx` | Left sidebar wrapper |
| `components/sidebar-left/resource-browser/index.tsx` | Resource browser panel |
| `components/sidebar-right/index.tsx` | Right sidebar wrapper |
| `components/sidebar-right/tool-panel/index.tsx` | Tool selection buttons |
| `components/sidebar-right/color-picker/index.tsx` | Color palette |
| `components/sidebar-right/layer-list/index.tsx` | Layer management |
| `components/sidebar-right/brush-settings/index.tsx` | Brush size control |
| `components/canvas/index.tsx` | Canvas container with mouse handlers |
| `components/canvas/pixel-canvas.tsx` | Canvas rendering component |
| `components/timeline/index.tsx` | Timeline container |
| `components/timeline/frame-strip.tsx` | Frame thumbnails |
| `components/timeline/playback-controls.tsx` | Play/pause/loop controls |
| `components/modals/export-modal.tsx` | Export dialog (PNG/GIF) |
| `components/modals/new-canvas-modal.tsx` | New canvas size dialog |
| `lib/canvas/engine.ts` | Canvas engine core |
| `lib/canvas/renderer.ts` | Render pipeline |
| `lib/canvas/tools/pencil.ts` | Pencil tool logic |
| `lib/canvas/tools/eraser.ts` | Eraser tool logic |
| `lib/canvas/tools/fill.ts` | Flood fill algorithm |
| `lib/canvas/tools/eyedropper.ts` | Color picker tool |
| `lib/canvas/history.ts` | Undo/redo command pattern |
| `lib/canvas/grid.ts` | Grid overlay helpers |
| `lib/canvas/export.ts` | Export functions (PNG, GIF, spritesheet) |
| `lib/store/pixel-store.ts` | Zustand store |
| `lib/i18n/zh.ts` | Chinese translations |
| `lib/i18n/en.ts` | English translations |
| `lib/theme/maple.css` | MapleStory pixel theme CSS |
| `lib/types.ts` | Shared TypeScript types |
| `public/fonts/press-start-2p.woff2` | Pixel font |

---

### Task 1: Project Bootstrap

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `app/globals.css`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "pixel-studio",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15.2.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.0",
    "swr": "^2.3.0",
    "gifenc": "^1.0.3",
    "next-intl": "^3.26.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.7.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.5.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.2.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create tailwind.config.ts**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', "monospace"],
      },
      colors: {
        maple: {
          bg: "var(--bg-primary)",
          panel: "var(--bg-secondary)",
          widget: "var(--bg-tertiary)",
          border: "var(--border-color)",
          text: "var(--text-primary)",
          textMuted: "var(--text-secondary)",
          accent: "var(--accent)",
          accentHover: "var(--accent-hover)",
          danger: "var(--danger)",
          success: "var(--success)",
        },
      },
      boxShadow: {
        pixel: "var(--pixel-shadow)",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 4: Create next.config.ts**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "maplestory.io",
        pathname: "/api/**",
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 5: Create postcss.config.mjs**

```javascript
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

- [ ] **Step 6: Create app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root,
[data-theme="maple"] {
  --bg-primary: #2C1810;
  --bg-secondary: #4A2C1A;
  --bg-tertiary: #6B3A2A;
  --border-color: #8B5E3C;
  --text-primary: #F5DEB3;
  --text-secondary: #D2B48C;
  --accent: #FFD700;
  --accent-hover: #FFA500;
  --danger: #E83030;
  --success: #22C55E;
  --pixel-shadow: 4px 4px 0px #1A0F08;
}

@layer base {
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: "Press Start 2P", monospace;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-size: 10px;
    line-height: 1.6;
  }

  ::selection {
    background-color: var(--accent);
    color: var(--bg-primary);
  }
}

@layer components {
  .pixel-border {
    border: 2px solid var(--border-color);
    box-shadow: 4px 4px 0px #1A0F08;
  }

  .pixel-btn {
    border: 2px solid var(--border-color);
    box-shadow: 2px 2px 0px #1A0F08;
    transition: all 0.05s ease;
  }

  .pixel-btn:hover {
    box-shadow: 1px 1px 0px #1A0F08;
    transform: translate(1px, 1px);
  }

  .pixel-btn:active {
    box-shadow: none;
    transform: translate(2px, 2px);
  }

  .pixel-btn.active {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent);
  }

  .pixel-panel {
    background-color: var(--bg-secondary);
    border: 2px solid var(--border-color);
    box-shadow: 4px 4px 0px #1A0F08;
  }

  .checkerboard {
    background-image:
      linear-gradient(45deg, #ccc 25%, transparent 25%),
      linear-gradient(-45deg, #ccc 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #ccc 75%),
      linear-gradient(-45deg, transparent 75%, #ccc 75%);
    background-size: 16px 16px;
    background-position: 0 0, 0 8px, 8px -8px, -8px 0;
  }
}
```

- [ ] **Step 7: Install dependencies**

```bash
npm install && npm install --save-dev @types/node @types/react @types/react-dom
```

Expected: All packages installed successfully.

- [ ] **Step 8: Verify build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: bootstrap Next.js project with Tailwind CSS and pixel theme"
```

---

### Task 2: Shared Types and State Store

**Files:**
- Create: `lib/types.ts`
- Create: `lib/store/pixel-store.ts`

- [ ] **Step 1: Create lib/types.ts**

```typescript
// Core canvas configuration
export interface CanvasConfig {
  width: number;       // grid width in pixels
  height: number;      // grid height in pixels
  pixelSize: number;   // render size per pixel in screen px
}

// A single pixel layer
export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;     // 0-1
  pixels: Map<string, string>;  // "x,y" -> "#RRGGBBAA"
}

// A single animation frame
export interface Frame {
  id: string;
  name: string;
  layerData: Map<string, Map<string, string>>; // layerId -> pixels snapshot
  duration: number;    // ms
}

// Tool types
export type ToolType =
  | "pencil"
  | "eraser"
  | "fill"
  | "eyedropper"
  | "selection"
  | "line";

// Canvas store state
export interface PixelState {
  // Canvas
  canvas: CanvasConfig;
  setCanvasSize: (w: number, h: number) => void;

  // Layers
  layers: Layer[];
  activeLayerId: string | null;
  addLayer: () => void;
  removeLayer: (id: string) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  setLayerOpacity: (id: string, opacity: number) => void;
  setActiveLayer: (id: string) => void;
  renameLayer: (id: string, name: string) => void;
  getActiveLayer: () => Layer | undefined;

  // Pixels
  setPixel: (x: number, y: number, color: string) => void;
  clearPixel: (x: number, y: number) => void;
  floodFill: (x: number, y: number, color: string) => void;
  clearLayer: () => void;

  // Tools
  currentTool: ToolType;
  setCurrentTool: (tool: ToolType) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;

  // Color
  currentColor: string;
  setColor: (color: string) => void;
  palette: string[];

  // Frames
  frames: Frame[];
  activeFrameIndex: number;
  setActiveFrame: (index: number) => void;
  addFrame: () => void;
  deleteFrame: (index: number) => void;
  duplicateFrame: (index: number) => void;
  getFramePixels: (frameIndex: number, layerId: string) => Map<string, string>;

  // Playback
  isPlaying: boolean;
  fps: number;
  togglePlayback: () => void;
  setFps: (fps: number) => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // View
  zoom: number;
  setZoom: (zoom: number) => void;
  pan: { x: number; y: number };
  setPan: (x: number, y: number) => void;
  showGrid: boolean;
  toggleGrid: () => void;
  onionSkin: { enabled: boolean; prev: number; next: number };
  setOnionSkin: (config: { enabled?: boolean; prev?: number; next?: number }) => void;
}
```

- [ ] **Step 2: Create lib/store/pixel-store.ts**

```typescript
import { create } from "zustand";
import type { PixelState, Layer, Frame, ToolType } from "@/lib/types";

const generateId = () => Math.random().toString(36).slice(2, 9);

const createLayer = (name: string, width: number, height: number): Layer => ({
  id: generateId(),
  name,
  visible: true,
  locked: false,
  opacity: 1,
  pixels: new Map<string, string>(),
});

const createFrame = (name: string, layers: Layer[]): Frame => ({
  id: generateId(),
  name,
  layerData: new Map(layers.map((l) => [l.id, new Map(l.pixels)])),
  duration: 100, // 100ms = 10 FPS default per frame
});

// Default MapleStory-inspired palette
const defaultPalette = [
  "#000000", "#FFFFFF",
  "#E83030", "#C41E3A", "#FF6B6B",
  "#3B82F6", "#1E40AF", "#93C5FD",
  "#22C55E", "#16A34A", "#86EFAC",
  "#F59E0B", "#D97706", "#FDE68A",
  "#8B4513", "#A0522D", "#DEB887",
  "#6B7280", "#9CA3AF", "#D1D5DB",
];

export const usePixelStore = create<PixelState>((set, get) => {
  const initialLayer = createLayer("Layer 1", 32, 32);
  const initialFrame = createFrame("Frame 1", [initialLayer]);

  return {
    // Canvas
    canvas: { width: 32, height: 32, pixelSize: 16 },
    setCanvasSize: (width, height) =>
      set((state) => ({
        canvas: { ...state.canvas, width, height },
      })),

    // Layers
    layers: [initialLayer],
    activeLayerId: initialLayer.id,
    addLayer: () =>
      set((state) => {
        const newLayer = createLayer(
          `Layer ${state.layers.length + 1}`,
          state.canvas.width,
          state.canvas.height
        );
        return {
          layers: [...state.layers, newLayer],
          activeLayerId: newLayer.id,
        };
      }),
    removeLayer: (id) =>
      set((state) => {
        if (state.layers.length <= 1) return state;
        const newLayers = state.layers.filter((l) => l.id !== id);
        return {
          layers: newLayers,
          activeLayerId:
            state.activeLayerId === id
              ? newLayers[newLayers.length - 1].id
              : state.activeLayerId,
        };
      }),
    toggleLayerVisibility: (id) =>
      set((state) => ({
        layers: state.layers.map((l) =>
          l.id === id ? { ...l, visible: !l.visible } : l
        ),
      })),
    toggleLayerLock: (id) =>
      set((state) => ({
        layers: state.layers.map((l) =>
          l.id === id ? { ...l, locked: !l.locked } : l
        ),
      })),
    setLayerOpacity: (id, opacity) =>
      set((state) => ({
        layers: state.layers.map((l) =>
          l.id === id ? { ...l, opacity: Math.max(0, Math.min(1, opacity)) } : l
        ),
      })),
    setActiveLayer: (id) => set({ activeLayerId: id }),
    renameLayer: (id, name) =>
      set((state) => ({
        layers: state.layers.map((l) => (l.id === id ? { ...l, name } : l)),
      })),
    getActiveLayer: () => {
      const state = get();
      return state.layers.find((l) => l.id === state.activeLayerId);
    },

    // Pixels
    setPixel: (x, y, color) =>
      set((state) => {
        if (x < 0 || x >= state.canvas.width || y < 0 || y >= state.canvas.height)
          return state;
        const layer = state.layers.find((l) => l.id === state.activeLayerId);
        if (!layer || layer.locked) return state;
        const newLayers = state.layers.map((l) => {
          if (l.id !== state.activeLayerId) return l;
          const newPixels = new Map(l.pixels);
          newPixels.set(`${x},${y}`, color);
          return { ...l, pixels: newPixels };
        });
        return { layers: newLayers };
      }),

    clearPixel: (x, y) =>
      set((state) => {
        const layer = state.layers.find((l) => l.id === state.activeLayerId);
        if (!layer || layer.locked) return state;
        const newLayers = state.layers.map((l) => {
          if (l.id !== state.activeLayerId) return l;
          const newPixels = new Map(l.pixels);
          newPixels.delete(`${x},${y}`);
          return { ...l, pixels: newPixels };
        });
        return { layers: newLayers };
      }),

    floodFill: (startX, startY, fillColor) =>
      set((state) => {
        const layer = state.layers.find((l) => l.id === state.activeLayerId);
        if (!layer || layer.locked) return state;
        const key = `${startX},${startY}`;
        const targetColor = layer.pixels.get(key);
        if (targetColor === fillColor) return state;

        const newPixels = new Map(layer.pixels);
        const queue = [[startX, startY]];
        const visited = new Set<string>();
        visited.add(key);

        while (queue.length > 0) {
          const [cx, cy] = queue.shift()!;
          const cKey = `${cx},${cy}`;
          const currentColor = newPixels.get(cKey);

          if (currentColor === targetColor) {
            newPixels.set(cKey, fillColor);

            const neighbors = [
              [cx + 1, cy],
              [cx - 1, cy],
              [cx, cy + 1],
              [cx, cy - 1],
            ];
            for (const [nx, ny] of neighbors) {
              const nKey = `${nx},${ny}`;
              if (
                nx >= 0 &&
                nx < state.canvas.width &&
                ny >= 0 &&
                ny < state.canvas.height &&
                !visited.has(nKey) &&
                newPixels.get(nKey) === targetColor
              ) {
                visited.add(nKey);
                queue.push([nx, ny]);
              }
            }
          }
        }

        return {
          layers: state.layers.map((l) =>
            l.id === state.activeLayerId ? { ...l, pixels: newPixels } : l
          ),
        };
      }),

    clearLayer: () =>
      set((state) => ({
        layers: state.layers.map((l) =>
          l.id === state.activeLayerId
            ? { ...l, pixels: new Map<string, string>() }
            : l
        ),
      })),

    // Tools
    currentTool: "pencil" as ToolType,
    setCurrentTool: (tool) => set({ currentTool: tool }),
    brushSize: 1,
    setBrushSize: (size) => set({ brushSize: size }),

    // Color
    currentColor: "#E83030",
    setColor: (color) => set({ currentColor: color }),
    palette: defaultPalette,

    // Frames
    frames: [initialFrame],
    activeFrameIndex: 0,
    setActiveFrame: (index) => set({ activeFrameIndex: index }),

    addFrame: () =>
      set((state) => {
        const newFrame = createFrame(
          `Frame ${state.frames.length + 1}`,
          state.layers
        );
        return {
          frames: [...state.frames, newFrame],
          activeFrameIndex: state.frames.length,
        };
      }),

    deleteFrame: (index) =>
      set((state) => {
        if (state.frames.length <= 1) return state;
        const newFrames = state.frames.filter((_, i) => i !== index);
        return {
          frames: newFrames,
          activeFrameIndex: Math.min(
            state.activeFrameIndex,
            newFrames.length - 1
          ),
        };
      }),

    duplicateFrame: (index) =>
      set((state) => {
        const source = state.frames[index];
        const newFrame: Frame = {
          id: generateId(),
          name: `${source.name} (copy)`,
          layerData: new Map(
            Array.from(source.layerData.entries()).map(
              ([k, v]) => [k, new Map(v)]
            )
          ),
          duration: source.duration,
        };
        const newFrames = [...state.frames];
        newFrames.splice(index + 1, 0, newFrame);
        return {
          frames: newFrames,
          activeFrameIndex: index + 1,
        };
      }),

    getFramePixels: (frameIndex, layerId) => {
      const state = get();
      const frame = state.frames[frameIndex];
      if (!frame) return new Map<string, string>();
      return frame.layerData.get(layerId) || new Map();
    },

    // Playback
    isPlaying: false,
    fps: 12,
    togglePlayback: () =>
      set((state) => ({ isPlaying: !state.isPlaying })),
    setFps: (fps) => set({ fps: Math.max(1, Math.min(60, fps)) }),

    // History (stub — will be enhanced in Task 3)
    undo: () => {},
    redo: () => {},
    canUndo: false,
    canRedo: false,

    // View
    zoom: 1,
    setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(32, zoom)) }),
    pan: { x: 0, y: 0 },
    setPan: (x, y) => set({ pan: { x, y } }),
    showGrid: true,
    toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
    onionSkin: { enabled: false, prev: 1, next: 0 },
    setOnionSkin: (config) =>
      set((state) => ({
        onionSkin: { ...state.onionSkin, ...config },
      })),
  };
});
```

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts lib/store/pixel-store.ts
git commit -m "feat: add shared types and Zustand pixel store"
```

---

### Task 3: Canvas Engine and Renderer

**Files:**
- Create: `lib/canvas/engine.ts`
- Create: `lib/canvas/renderer.ts`
- Create: `lib/canvas/grid.ts`
- Create: `lib/canvas/tools/pencil.ts`
- Create: `lib/canvas/tools/eraser.ts`
- Create: `lib/canvas/tools/fill.ts`
- Create: `lib/canvas/tools/eyedropper.ts`

- [ ] **Step 1: Create lib/canvas/engine.ts**

```typescript
import type { CanvasConfig } from "@/lib/types";

/**
 * Calculate optimal pixelSize (screen pixels per grid pixel)
 * so the canvas fits within the available container space.
 */
export function calculatePixelSize(
  canvas: CanvasConfig,
  containerWidth: number,
  containerHeight: number,
  zoom: number
): number {
  const scaleX = containerWidth / canvas.width;
  const scaleY = containerHeight / canvas.height;
  const baseSize = Math.min(scaleX, scaleY);
  return Math.max(1, Math.floor(baseSize * zoom));
}

/**
 * Convert mouse coordinates to canvas grid coordinates.
 */
export function screenToGrid(
  screenX: number,
  screenY: number,
  canvasOffsetX: number,
  canvasOffsetY: number,
  pixelSize: number
): { x: number; y: number } {
  const x = Math.floor((screenX - canvasOffsetX) / pixelSize);
  const y = Math.floor((screenY - canvasOffsetY) / pixelSize);
  return { x, y };
}

/**
 * Convert grid coordinates to screen pixel position.
 */
export function gridToScreen(
  gridX: number,
  gridY: number,
  canvasOffsetX: number,
  canvasOffsetY: number,
  pixelSize: number
): { x: number; y: number } {
  return {
    x: canvasOffsetX + gridX * pixelSize,
    y: canvasOffsetY + gridY * pixelSize,
  };
}
```

- [ ] **Step 2: Create lib/canvas/renderer.ts**

```typescript
import type { Layer, CanvasConfig } from "@/lib/types";

const CHECKER_SIZE = 8;

/**
 * Render the checkerboard transparency background.
 */
export function renderCheckerboard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const light = "#E8E8E8";
  const dark = "#CCCCCC";

  for (let y = 0; y < height; y += CHECKER_SIZE * 2) {
    for (let x = 0; x < width; x += CHECKER_SIZE * 2) {
      ctx.fillStyle = light;
      ctx.fillRect(x, y, CHECKER_SIZE, CHECKER_SIZE);
      ctx.fillRect(x + CHECKER_SIZE, y + CHECKER_SIZE, CHECKER_SIZE, CHECKER_SIZE);
      ctx.fillStyle = dark;
      ctx.fillRect(x + CHECKER_SIZE, y, CHECKER_SIZE, CHECKER_SIZE);
      ctx.fillRect(x, y + CHECKER_SIZE, CHECKER_SIZE, CHECKER_SIZE);
    }
  }
}

/**
 * Render a single layer's pixels onto the canvas.
 */
export function renderLayer(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  pixelSize: number
) {
  if (!layer.visible || layer.opacity === 0) return;

  ctx.globalAlpha = layer.opacity;

  for (const [key, color] of layer.pixels) {
    const [x, y] = key.split(",").map(Number);
    ctx.fillStyle = color;
    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
  }

  ctx.globalAlpha = 1;
}

/**
 * Render the grid overlay.
 */
export function renderGrid(
  ctx: CanvasRenderingContext2D,
  canvas: CanvasConfig,
  pixelSize: number
) {
  if (pixelSize < 4) return; // Don't draw grid when zoomed out too far

  ctx.strokeStyle = "rgba(128, 128, 128, 0.3)";
  ctx.lineWidth = 1;

  for (let x = 0; x <= canvas.width; x++) {
    const px = x * pixelSize + 0.5;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, canvas.height * pixelSize);
    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y++) {
    const py = y * pixelSize + 0.5;
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(canvas.width * pixelSize, py);
    ctx.stroke();
  }
}

/**
 * Full render pipeline: clear → checkerboard → layers → grid.
 */
export function renderCanvas(
  ctx: CanvasRenderingContext2D,
  canvas: CanvasConfig,
  layers: Layer[],
  showGrid: boolean,
  pixelSize: number,
  canvasWidth: number,
  canvasHeight: number
) {
  // Clear
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Checkerboard background
  renderCheckerboard(ctx, canvas.width * pixelSize, canvas.height * pixelSize);

  // Render each visible layer in order
  for (const layer of layers) {
    renderLayer(ctx, layer, pixelSize);
  }

  // Grid overlay
  if (showGrid) {
    renderGrid(ctx, canvas, pixelSize);
  }
}
```

- [ ] **Step 3: Create lib/canvas/grid.ts**

```typescript
/**
 * Clamp grid coordinates to canvas bounds.
 */
export function clampToCanvas(
  x: number,
  y: number,
  width: number,
  height: number
): { x: number; y: number } {
  return {
    x: Math.max(0, Math.min(width - 1, x)),
    y: Math.max(0, Math.min(height - 1, y)),
  };
}

/**
 * Get neighboring pixels for brush of given size.
 * Returns array of [x, y] offsets from center.
 */
export function getBrushPixels(size: number): [number, number][] {
  const pixels: [number, number][] = [];
  const half = Math.floor(size / 2);

  for (let dy = -half; dy <= half; dy++) {
    for (let dx = -half; dx <= half; dx++) {
      pixels.push([dx, dy]);
    }
  }

  return pixels;
}
```

- [ ] **Step 4: Create lib/canvas/tools/pencil.ts**

```typescript
import type { Layer, CanvasConfig } from "@/lib/types";
import { clampToCanvas, getBrushPixels } from "@/lib/canvas/grid";

/**
 * Draw a pixel at (x, y) with current brush size.
 */
export function drawPixel(
  layers: Layer[],
  activeLayerId: string,
  x: number,
  y: number,
  color: string,
  canvas: CanvasConfig,
  brushSize: number = 1
): Layer[] {
  const { x: cx, y: cy } = clampToCanvas(x, y, canvas.width, canvas.height);
  const brushOffsets = getBrushPixels(brushSize);

  return layers.map((layer) => {
    if (layer.id !== activeLayerId || layer.locked) return layer;
    const newPixels = new Map(layer.pixels);

    for (const [dx, dy] of brushOffsets) {
      const px = clampToCanvas(cx + dx, cy + dy, canvas.width, canvas.height);
      newPixels.set(`${px.x},${px.y}`, color);
    }

    return { ...layer, pixels: newPixels };
  });
}
```

- [ ] **Step 5: Create lib/canvas/tools/eraser.ts**

```typescript
import type { Layer, CanvasConfig } from "@/lib/types";
import { clampToCanvas, getBrushPixels } from "@/lib/canvas/grid";

/**
 * Erase pixels at (x, y) with current brush size.
 */
export function erasePixel(
  layers: Layer[],
  activeLayerId: string,
  x: number,
  y: number,
  canvas: CanvasConfig,
  brushSize: number = 1
): Layer[] {
  const { x: cx, y: cy } = clampToCanvas(x, y, canvas.width, canvas.height);
  const brushOffsets = getBrushPixels(brushSize);

  return layers.map((layer) => {
    if (layer.id !== activeLayerId || layer.locked) return layer;
    const newPixels = new Map(layer.pixels);

    for (const [dx, dy] of brushOffsets) {
      const px = clampToCanvas(cx + dx, cy + dy, canvas.width, canvas.height);
      newPixels.delete(`${px.x},${px.y}`);
    }

    return { ...layer, pixels: newPixels };
  });
}
```

- [ ] **Step 6: Create lib/canvas/tools/fill.ts**

```typescript
import type { Layer, CanvasConfig } from "@/lib/types";

/**
 * Flood fill from (startX, startY) with fillColor.
 * Uses BFS algorithm.
 */
export function floodFill(
  layers: Layer[],
  activeLayerId: string,
  startX: number,
  startY: number,
  fillColor: string,
  canvas: CanvasConfig
): Layer[] {
  return layers.map((layer) => {
    if (layer.id !== activeLayerId || layer.locked) return layer;

    const targetColor = layer.pixels.get(`${startX},${startY}`);
    if (targetColor === fillColor) return layer;

    const newPixels = new Map(layer.pixels);
    const queue: [number, number][] = [[startX, startY]];
    const visited = new Set<string>();
    visited.add(`${startX},${startY}`);

    while (queue.length > 0) {
      const [cx, cy] = queue.shift()!;
      const cKey = `${cx},${cy}`;
      const currentColor = newPixels.get(cKey);

      if (currentColor === targetColor) {
        newPixels.set(cKey, fillColor);

        const neighbors: [number, number][] = [
          [cx + 1, cy],
          [cx - 1, cy],
          [cx, cy + 1],
          [cx, cy - 1],
        ];

        for (const [nx, ny] of neighbors) {
          const nKey = `${nx},${ny}`;
          if (
            nx >= 0 &&
            nx < canvas.width &&
            ny >= 0 &&
            ny < canvas.height &&
            !visited.has(nKey) &&
            newPixels.get(nKey) === targetColor
          ) {
            visited.add(nKey);
            queue.push([nx, ny]);
          }
        }
      }
    }

    return { ...layer, pixels: newPixels };
  });
}
```

- [ ] **Step 7: Create lib/canvas/tools/eyedropper.ts**

```typescript
import type { Layer } from "@/lib/types";

/**
 * Pick color from pixel at (x, y) from the topmost visible layer.
 */
export function pickColor(
  layers: Layer[],
  x: number,
  y: number
): string | null {
  const key = `${x},${y}`;

  // Search from top layer to bottom
  for (let i = layers.length - 1; i >= 0; i--) {
    const layer = layers[i];
    if (!layer.visible) continue;
    const color = layer.pixels.get(key);
    if (color) return color;
  }

  return null;
}
```

- [ ] **Step 8: Commit**

```bash
git add lib/canvas/engine.ts lib/canvas/renderer.ts lib/canvas/grid.ts \
  lib/canvas/tools/pencil.ts lib/canvas/tools/eraser.ts \
  lib/canvas/tools/fill.ts lib/canvas/tools/eyedropper.ts
git commit -m "feat: add canvas engine, renderer, grid, and drawing tools"
```

---

### Task 4: Canvas UI Components

**Files:**
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/canvas/page.tsx`
- Create: `components/header/index.tsx`
- Create: `components/canvas/index.tsx`
- Create: `components/canvas/pixel-canvas.tsx`

- [ ] **Step 1: Create app/layout.tsx**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pixel Studio — 像素画工坊",
  description: "A MapleStory-inspired pixel art editor",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" data-theme="maple">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Create app/page.tsx**

```tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center" style={{
      background: "var(--bg-primary)",
    }}>
      <div className="text-center pixel-panel p-12">
        <h1
          className="text-3xl font-bold mb-4"
          style={{ color: "var(--accent)" }}
        >
          Pixel Studio
        </h1>
        <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
          像素画工坊 — MapleStory 风格创作工具
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/canvas"
            className="pixel-btn px-6 py-3 font-bold"
            style={{
              background: "var(--accent)",
              color: "var(--bg-primary)",
            }}
          >
            开始创作
          </Link>
          <Link
            href="/settings"
            className="pixel-btn px-6 py-3 font-bold"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
            }}
          >
            设置
          </Link>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Create app/canvas/page.tsx**

```tsx
import { Header } from "@/components/header";
import { SidebarLeft } from "@/components/sidebar-left";
import { SidebarRight } from "@/components/sidebar-right";
import { CanvasContainer } from "@/components/canvas";
import { Timeline } from "@/components/timeline";

export default function CanvasPage() {
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
```

- [ ] **Step 4: Create components/header/index.tsx**

```tsx
"use client";

import { usePixelStore } from "@/lib/store/pixel-store";
import { useState } from "react";

export function Header() {
  const { canvas, frames } = usePixelStore();
  const [lang, setLang] = useState<"zh" | "en">("zh");

  return (
    <header
      className="flex items-center justify-between px-4 h-12 shrink-0"
      style={{
        background: "var(--bg-secondary)",
        borderBottom: "2px solid var(--border-color)",
      }}
    >
      <div className="flex items-center gap-4">
        <span
          className="text-sm font-bold"
          style={{ color: "var(--accent)" }}
        >
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
        >
          {lang === "zh" ? "中文" : "EN"}
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 5: Create components/canvas/pixel-canvas.tsx**

```tsx
"use client";

import { useRef, useEffect, useCallback } from "react";
import { usePixelStore } from "@/lib/store/pixel-store";
import { renderCanvas } from "@/lib/canvas/renderer";
import { screenToGrid, calculatePixelSize } from "@/lib/canvas/engine";

export function PixelCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);

  const {
    canvas,
    layers,
    currentTool,
    currentColor,
    showGrid,
    zoom,
    brushSize,
    setPixel,
    clearPixel,
    floodFill,
  } = usePixelStore();

  const render = useCallback(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    const pixelSize = calculatePixelSize(
      canvas,
      el.clientWidth,
      el.clientHeight,
      zoom
    );

    const totalWidth = canvas.width * pixelSize;
    const totalHeight = canvas.height * pixelSize;

    el.width = totalWidth;
    el.height = totalHeight;

    renderCanvas(ctx, canvas, layers, showGrid, pixelSize, totalWidth, totalHeight);
  }, [canvas, layers, showGrid, zoom]);

  useEffect(() => {
    render();
  }, [render]);

  const getGridCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const el = canvasRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const pixelSize = calculatePixelSize(canvas, el.clientWidth, el.clientHeight, zoom);
    return screenToGrid(e.clientX, e.clientY, rect.left, rect.top, pixelSize);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDrawing.current = true;
    applyTool(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing.current) return;
    // For pencil and eraser, apply on drag
    if (currentTool === "pencil" || currentTool === "eraser") {
      applyTool(e);
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const applyTool = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getGridCoords(e);

    switch (currentTool) {
      case "pencil":
        setPixel(x, y, currentColor);
        break;
      case "eraser":
        clearPixel(x, y);
        break;
      case "fill":
        floodFill(x, y, currentColor);
        break;
      case "eyedropper":
        // Color picking handled via getImageData in the component
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center overflow-hidden flex-1"
      style={{ background: "var(--bg-primary)" }}
    >
      <canvas
        ref={canvasRef}
        className="pixel-border"
        style={{ imageRendering: "pixelated", cursor: getCursor(currentTool) }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}

function getCursor(tool: string): string {
  switch (tool) {
    case "pencil":
      return "crosshair";
    case "eraser":
      return "cell";
    case "fill":
      return "pointer";
    case "eyedropper":
      return "crosshair";
    default:
      return "crosshair";
  }
}
```

- [ ] **Step 6: Create components/canvas/index.tsx**

```tsx
"use client";

import { PixelCanvas } from "./pixel-canvas";
import { usePixelStore } from "@/lib/store/pixel-store";

export function CanvasContainer() {
  const { zoom, setZoom } = usePixelStore();

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.5 : 0.5;
    setZoom(Math.max(0.5, Math.min(32, zoom + delta)));
  };

  return (
    <div
      className="flex-1 relative overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
      onWheel={handleWheel}
    >
      <PixelCanvas />
      {/* Zoom indicator */}
      <div
        className="absolute bottom-2 right-2 px-2 py-1 text-xs"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          color: "var(--text-secondary)",
        }}
      >
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add app/layout.tsx app/page.tsx app/canvas/page.tsx \
  components/header/index.tsx components/canvas/index.tsx \
  components/canvas/pixel-canvas.tsx
git commit -m "feat: add canvas UI components with layout and page"
```

---

### Task 5: Sidebar Components

**Files:**
- Create: `components/sidebar-left/index.tsx`
- Create: `components/sidebar-left/resource-browser/index.tsx`
- Create: `components/sidebar-right/index.tsx`
- Create: `components/sidebar-right/tool-panel/index.tsx`
- Create: `components/sidebar-right/color-picker/index.tsx`
- Create: `components/sidebar-right/layer-list/index.tsx`
- Create: `components/sidebar-right/brush-settings/index.tsx`

- [ ] **Step 1: Create components/sidebar-left/index.tsx**

```tsx
import { ResourceBrowser } from "./resource-browser";

export function SidebarLeft() {
  return (
    <aside
      className="w-60 shrink-0 overflow-y-auto"
      style={{
        background: "var(--bg-secondary)",
        borderRight: "2px solid var(--border-color)",
      }}
    >
      <ResourceBrowser />
    </aside>
  );
}
```

- [ ] **Step 2: Create components/sidebar-left/resource-browser/index.tsx**

```tsx
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
```

- [ ] **Step 3: Create components/sidebar-right/index.tsx**

```tsx
import { ToolPanel } from "./tool-panel";
import { ColorPicker } from "./color-picker";
import { LayerList } from "./layer-list";
import { BrushSettings } from "./brush-settings";

export function SidebarRight() {
  return (
    <aside
      className="w-56 shrink-0 overflow-y-auto flex flex-col gap-2 p-2"
      style={{
        background: "var(--bg-secondary)",
        borderLeft: "2px solid var(--border-color)",
      }}
    >
      <ToolPanel />
      <BrushSettings />
      <ColorPicker />
      <LayerList />
    </aside>
  );
}
```

- [ ] **Step 4: Create components/sidebar-right/tool-panel/index.tsx**

```tsx
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
```

- [ ] **Step 5: Create components/sidebar-right/color-picker/index.tsx**

```tsx
"use client";

import { usePixelStore } from "@/lib/store/pixel-store";

export function ColorPicker() {
  const { palette, currentColor, setColor } = usePixelStore();

  return (
    <div className="pixel-panel p-2">
      <div
        className="text-xs font-bold mb-2"
        style={{ color: "var(--accent)" }}
      >
        调色板
      </div>

      {/* Current color preview */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 pixel-border"
          style={{ backgroundColor: currentColor }}
        />
        <input
          type="color"
          value={currentColor}
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8 cursor-pointer"
        />
        <span
          className="text-xs font-mono"
          style={{ color: "var(--text-secondary)" }}
        >
          {currentColor}
        </span>
      </div>

      {/* Palette grid */}
      <div className="grid grid-cols-6 gap-1">
        {palette.map((color, i) => (
          <button
            key={i}
            className="w-5 h-5 pixel-border"
            style={{
              backgroundColor: color,
              outline:
                currentColor === color
                  ? "2px solid var(--accent)"
                  : "none",
              outlineOffset: "1px",
            }}
            onClick={() => setColor(color)}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create components/sidebar-right/layer-list/index.tsx**

```tsx
"use client";

import { usePixelStore } from "@/lib/store/pixel-store";

export function LayerList() {
  const { layers, activeLayerId, setActiveLayer, addLayer, removeLayer, toggleLayerVisibility, toggleLayerLock } =
    usePixelStore();

  return (
    <div className="pixel-panel p-2">
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs font-bold"
          style={{ color: "var(--accent)" }}
        >
          图层
        </span>
        <button
          className="pixel-btn px-2 py-1 text-xs"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-primary)",
          }}
          onClick={addLayer}
        >
          +
        </button>
      </div>

      <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
        {[...layers].reverse().map((layer) => (
          <div
            key={layer.id}
            className={`flex items-center gap-1 px-1 py-1 cursor-pointer ${
              layer.id === activeLayerId ? "pixel-border" : ""
            }`}
            style={{
              background:
                layer.id === activeLayerId
                  ? "var(--bg-tertiary)"
                  : "transparent",
            }}
            onClick={() => setActiveLayer(layer.id)}
          >
            {/* Visibility toggle */}
            <button
              className="text-xs w-4 h-4 flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                toggleLayerVisibility(layer.id);
              }}
            >
              {layer.visible ? "👁" : "🚫"}
            </button>

            {/* Lock toggle */}
            <button
              className="text-xs w-4 h-4 flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                toggleLayerLock(layer.id);
              }}
            >
              {layer.locked ? "🔒" : "🔓"}
            </button>

            {/* Layer name */}
            <span
              className="text-xs flex-1 truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {layer.name}
            </span>

            {/* Delete button */}
            {layers.length > 1 && (
              <button
                className="text-xs w-4 h-4 flex items-center justify-center"
                style={{ color: "var(--danger)" }}
                onClick={(e) => {
                  e.stopPropagation();
                  removeLayer(layer.id);
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create components/sidebar-right/brush-settings/index.tsx**

```tsx
"use client";

import { usePixelStore } from "@/lib/store/pixel-store";

export function BrushSettings() {
  const { brushSize, setBrushSize } = usePixelStore();

  return (
    <div className="pixel-panel p-2">
      <div
        className="text-xs font-bold mb-2"
        style={{ color: "var(--accent)" }}
      >
        笔刷
      </div>
      <div className="flex items-center gap-2">
        <span
          className="text-xs"
          style={{ color: "var(--text-secondary)" }}
        >
          大小: {brushSize}px
        </span>
        <input
          type="range"
          min={1}
          max={16}
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="flex-1"
        />
      </div>
      {/* Brush preview */}
      <div className="flex justify-center mt-2">
        <div
          className="bg-white"
          style={{
            width: `${brushSize * 3}px`,
            height: `${brushSize * 3}px`,
          }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add components/sidebar-left/ components/sidebar-right/
git commit -m "feat: add sidebar components with tools, colors, layers, brush"
```

---

### Task 6: Timeline Component

**Files:**
- Create: `components/timeline/index.tsx`
- Create: `components/timeline/frame-strip.tsx`
- Create: `components/timeline/playback-controls.tsx`

- [ ] **Step 1: Create components/timeline/playback-controls.tsx**

```tsx
"use client";

import { usePixelStore } from "@/lib/store/pixel-store";

export function PlaybackControls() {
  const { isPlaying, fps, setFps, togglePlayback } = usePixelStore();

  return (
    <div className="flex items-center gap-2 px-2">
      {/* Play/Pause */}
      <button
        className="pixel-btn px-3 py-1"
        style={{
          background: "var(--bg-tertiary)",
          color: "var(--text-primary)",
        }}
        onClick={togglePlayback}
      >
        {isPlaying ? "⏸" : "▶"}
      </button>

      {/* FPS control */}
      <div className="flex items-center gap-1">
        <span
          className="text-xs"
          style={{ color: "var(--text-secondary)" }}
        >
          FPS:
        </span>
        <input
          type="number"
          min={1}
          max={60}
          value={fps}
          onChange={(e) => setFps(Number(e.target.value))}
          className="w-12 px-1 py-1 text-xs"
          style={{
            background: "var(--bg-primary)",
            border: "2px solid var(--border-color)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      {/* Loop toggle */}
      <label className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
        <input type="checkbox" defaultChecked />
        Loop
      </label>
    </div>
  );
}
```

- [ ] **Step 2: Create components/timeline/frame-strip.tsx**

```tsx
"use client";

import { usePixelStore } from "@/lib/store/pixel-store";
import { useRef, useEffect } from "react";

export function FrameStrip() {
  const {
    frames,
    activeFrameIndex,
    setActiveFrame,
    addFrame,
    deleteFrame,
    duplicateFrame,
    canvas,
    layers,
  } = usePixelStore();

  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex items-center gap-2 flex-1 overflow-x-auto px-2">
      <div ref={scrollRef} className="flex gap-2">
        {frames.map((frame, index) => (
          <div
            key={frame.id}
            className={`flex flex-col items-center cursor-pointer ${
              index === activeFrameIndex ? "pixel-border" : ""
            }`}
            style={{
              background:
                index === activeFrameIndex
                  ? "var(--bg-tertiary)"
                  : "var(--bg-primary)",
              padding: "4px",
            }}
            onClick={() => setActiveFrame(index)}
          >
            {/* Frame thumbnail */}
            <div
              className="w-12 h-12 pixel-border"
              style={{ background: "#1a1a1a" }}
            >
              <canvas
                ref={(el) => {
                  if (!el || index !== activeFrameIndex) return;
                  const ctx = el.getContext("2d");
                  if (!ctx) return;
                  // Render current frame preview
                  const thumbSize = 48;
                  el.width = thumbSize;
                  el.height = thumbSize;
                  ctx.imageSmoothingEnabled = false;
                  // Simple pixel render for thumbnail
                  const scale = thumbSize / Math.max(canvas.width, canvas.height);
                  for (const layer of layers) {
                    if (!layer.visible) continue;
                    const pixels = frame.layerData.get(layer.id);
                    if (!pixels) continue;
                    ctx.globalAlpha = layer.opacity;
                    for (const [key, color] of pixels) {
                      const [x, y] = key.split(",").map(Number);
                      ctx.fillStyle = color;
                      ctx.fillRect(
                        x * scale,
                        y * scale,
                        Math.max(1, scale),
                        Math.max(1, scale)
                      );
                    }
                  }
                }}
                className="w-full h-full"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            <span
              className="text-xs mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              F{index + 1}
            </span>
          </div>
        ))}

        {/* Add frame button */}
        <button
          className="w-12 h-12 pixel-border flex items-center justify-center text-lg"
          style={{
            background: "var(--bg-primary)",
            color: "var(--text-secondary)",
          }}
          onClick={addFrame}
        >
          +
        </button>
      </div>

      {/* Frame actions */}
      <div className="flex gap-1 shrink-0">
        <button
          className="pixel-btn px-2 py-1 text-xs"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-primary)",
          }}
          onClick={() => duplicateFrame(activeFrameIndex)}
        >
          复制
        </button>
        {frames.length > 1 && (
          <button
            className="pixel-btn px-2 py-1 text-xs"
            style={{
              background: "var(--danger)",
              color: "#fff",
            }}
            onClick={() => deleteFrame(activeFrameIndex)}
          >
            删除
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create components/timeline/index.tsx**

```tsx
"use client";

import { PlaybackControls } from "./playback-controls";
import { FrameStrip } from "./frame-strip";
import { usePixelStore } from "@/lib/store/pixel-store";
import { useEffect, useRef } from "react";

export function Timeline() {
  const { isPlaying, fps, activeFrameIndex, frames, setActiveFrame } =
    usePixelStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setActiveFrame((activeFrameIndex + 1) % frames.length);
      }, 1000 / fps);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, fps, activeFrameIndex, frames.length, setActiveFrame]);

  return (
    <footer
      className="h-28 shrink-0 flex flex-col"
      style={{
        background: "var(--bg-secondary)",
        borderTop: "2px solid var(--border-color)",
      }}
    >
      {/* Controls row */}
      <div className="flex items-center h-8 shrink-0" style={{
        borderBottom: "1px solid var(--border-color)",
      }}>
        <PlaybackControls />
      </div>
      {/* Frame strip row */}
      <div className="flex-1 overflow-hidden py-2">
        <FrameStrip />
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/timeline/
git commit -m "feat: add timeline component with playback and frame strip"
```

---

### Task 7: Modals and Export

**Files:**
- Create: `components/modals/new-canvas-modal.tsx`
- Create: `components/modals/export-modal.tsx`
- Create: `lib/canvas/export.ts`

- [ ] **Step 1: Create lib/canvas/export.ts**

```typescript
import type { CanvasConfig, Layer, Frame } from "@/lib/types";

/**
 * Render all layers for a single frame to an offscreen canvas.
 */
function renderFrameToCanvas(
  frame: Frame,
  layers: Layer[],
  canvasSize: number,
  width: number,
  height: number
): HTMLCanvasElement {
  const offscreen = document.createElement("canvas");
  const pixelSize = canvasSize;
  offscreen.width = width * pixelSize;
  offscreen.height = height * pixelSize;
  const ctx = offscreen.getContext("2d")!;

  for (const layer of layers) {
    if (!layer.visible || layer.opacity === 0) continue;
    ctx.globalAlpha = layer.opacity;
    const pixels = frame.layerData.get(layer.id);
    if (!pixels) continue;
    for (const [key, color] of pixels) {
      const [x, y] = key.split(",").map(Number);
      ctx.fillStyle = color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }

  return offscreen;
}

/**
 * Export current frame as PNG.
 */
export function exportPNG(
  frame: Frame,
  layers: Layer[],
  canvas: CanvasConfig,
  pixelSize: number
): string {
  const offscreen = renderFrameToCanvas(
    frame,
    layers,
    pixelSize,
    canvas.width,
    canvas.height
  );
  return offscreen.toDataURL("image/png");
}

/**
 * Export all frames as sprite sheet (horizontal).
 */
export function exportSpriteSheet(
  frames: Frame[],
  layers: Layer[],
  canvas: CanvasConfig,
  pixelSize: number
): string {
  const offscreen = document.createElement("canvas");
  offscreen.width = canvas.width * pixelSize * frames.length;
  offscreen.height = canvas.height * pixelSize;
  const ctx = offscreen.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  frames.forEach((frame, i) => {
    const frameCanvas = renderFrameToCanvas(
      frame,
      layers,
      pixelSize,
      canvas.width,
      canvas.height
    );
    ctx.drawImage(
      frameCanvas,
      i * canvas.width * pixelSize,
      0,
      canvas.width * pixelSize,
      canvas.height * pixelSize
    );
  });

  return offscreen.toDataURL("image/png");
}

/**
 * Export animation as GIF (uses gifenc library).
 */
export async function exportGIF(
  frames: Frame[],
  layers: Layer[],
  canvas: CanvasConfig,
  pixelSize: number,
  fps: number
): Promise<Blob> {
  const { GIFEncoder, quantize, applyPalette } = await import("gifenc");

  const gif = GIFEncoder();
  const duration = 1000 / fps;

  for (const frame of frames) {
    const frameCanvas = renderFrameToCanvas(
      frame,
      layers,
      pixelSize,
      canvas.width,
      canvas.height
    );
    const ctx = frameCanvas.getContext("2d")!;
    const imageData = ctx.getImageData(
      0,
      0,
      frameCanvas.width,
      frameCanvas.height
    );

    const palette = quantize(imageData.data, 256);
    const index = applyPalette(imageData.data, palette);

    gif.writeFrame(index, frameCanvas.width, frameCanvas.height, palette, {
      delay: duration,
    });
  }

  return gif.finish();
}
```

- [ ] **Step 2: Create components/modals/new-canvas-modal.tsx**

```tsx
"use client";

import { useState } from "react";
import { usePixelStore } from "@/lib/store/pixel-store";

const presets = [
  { label: "32x32", w: 32, h: 32 },
  { label: "64x64", w: 64, h: 64 },
  { label: "96x96", w: 96, h: 96 },
  { label: "128x128", w: 128, h: 128 },
  { label: "256x256", w: 256, h: 256 },
];

interface Props {
  onClose: () => void;
}

export function NewCanvasModal({ onClose }: Props) {
  const { setCanvasSize } = usePixelStore();
  const [width, setWidth] = useState(64);
  const [height, setHeight] = useState(64);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: "rgba(0,0,0,0.7)" }}
    >
      <div className="pixel-panel p-6 w-80">
        <h2
          className="text-sm font-bold mb-4"
          style={{ color: "var(--accent)" }}
        >
          新建画布
        </h2>

        {/* Presets */}
        <div className="mb-4">
          <label
            className="text-xs block mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            预设尺寸
          </label>
          <div className="flex flex-wrap gap-1">
            {presets.map((p) => (
              <button
                key={p.label}
                className="pixel-btn px-2 py-1 text-xs"
                style={{
                  background:
                    width === p.w && height === p.h
                      ? "var(--accent)"
                      : "var(--bg-tertiary)",
                  color:
                    width === p.w && height === p.h
                      ? "var(--bg-primary)"
                      : "var(--text-primary)",
                }}
                onClick={() => {
                  setWidth(p.w);
                  setHeight(p.h);
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom size */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <label className="text-xs block mb-1" style={{ color: "var(--text-secondary)" }}>宽</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full px-2 py-1 text-xs"
              style={{
                background: "var(--bg-primary)",
                border: "2px solid var(--border-color)",
                color: "var(--text-primary)",
              }}
              min={1}
              max={512}
            />
          </div>
          <div className="flex-1">
            <label className="text-xs block mb-1" style={{ color: "var(--text-secondary)" }}>高</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full px-2 py-1 text-xs"
              style={{
                background: "var(--bg-primary)",
                border: "2px solid var(--border-color)",
                color: "var(--text-primary)",
              }}
              min={1}
              max={512}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <button
            className="pixel-btn px-4 py-2 text-xs"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
            }}
            onClick={onClose}
          >
            取消
          </button>
          <button
            className="pixel-btn px-4 py-2 text-xs"
            style={{
              background: "var(--accent)",
              color: "var(--bg-primary)",
            }}
            onClick={() => {
              setCanvasSize(width, height);
              onClose();
            }}
          >
            创建
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create components/modals/export-modal.tsx**

```tsx
"use client";

import { useState } from "react";
import { usePixelStore } from "@/lib/store/pixel-store";
import { exportPNG, exportSpriteSheet, exportGIF } from "@/lib/canvas/export";

interface Props {
  onClose: () => void;
}

export function ExportModal({ onClose }: Props) {
  const { frames, layers, canvas, fps } = usePixelStore();
  const [format, setFormat] = useState<"png" | "gif" | "spritesheet">("png");
  const [pixelSize, setPixelSize] = useState(1);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);

    try {
      const activeFrame = frames[0]; // Export first frame for PNG
      const ps = pixelSize;

      if (format === "png") {
        const dataUrl = exportPNG(activeFrame, layers, canvas, ps);
        download(dataUrl, "pixel-art.png");
      } else if (format === "spritesheet") {
        const dataUrl = exportSpriteSheet(frames, layers, canvas, ps);
        download(dataUrl, "sprite-sheet.png");
      } else if (format === "gif") {
        const blob = await exportGIF(frames, layers, canvas, ps, fps);
        const url = URL.createObjectURL(blob);
        download(url, "animation.gif");
        URL.revokeObjectURL(url);
      }
    } finally {
      setExporting(false);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: "rgba(0,0,0,0.7)" }}
    >
      <div className="pixel-panel p-6 w-80">
        <h2
          className="text-sm font-bold mb-4"
          style={{ color: "var(--accent)" }}
        >
          导出
        </h2>

        {/* Format selection */}
        <div className="mb-4">
          <label
            className="text-xs block mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            格式
          </label>
          <div className="flex gap-1">
            {(["png", "gif", "spritesheet"] as const).map((f) => (
              <button
                key={f}
                className={`pixel-btn px-3 py-1 text-xs ${
                  format === f ? "active" : ""
                }`}
                style={{
                  background:
                    format === f ? "var(--accent)" : "var(--bg-tertiary)",
                  color:
                    format === f
                      ? "var(--bg-primary)"
                      : "var(--text-primary)",
                }}
                onClick={() => setFormat(f)}
              >
                {f === "png" ? "PNG" : f === "gif" ? "GIF" : "Sprite Sheet"}
              </button>
            ))}
          </div>
        </div>

        {/* Pixel size (scale) */}
        <div className="mb-4">
          <label
            className="text-xs block mb-1"
            style={{ color: "var(--text-secondary)" }}
          >
            缩放: {pixelSize}x
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={pixelSize}
            onChange={(e) => setPixelSize(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <button
            className="pixel-btn px-4 py-2 text-xs"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
            }}
            onClick={onClose}
          >
            取消
          </button>
          <button
            className="pixel-btn px-4 py-2 text-xs"
            style={{
              background: "var(--accent)",
              color: "var(--bg-primary)",
            }}
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? "导出中..." : "导出"}
          </button>
        </div>
      </div>
    </div>
  );
}

function download(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}
```

- [ ] **Step 4: Commit**

```bash
git add components/modals/ lib/canvas/export.ts
git commit -m "feat: add export modal, new canvas modal, and export functions"
```

---

### Task 8: Settings Page and i18n

**Files:**
- Create: `app/settings/page.tsx`
- Create: `lib/i18n/zh.ts`
- Create: `lib/i18n/en.ts`
- Create: `lib/theme/maple.css`

- [ ] **Step 1: Create lib/i18n/zh.ts**

```typescript
export const zh = {
  common: {
    title: "Pixel Studio — 像素画工坊",
    startCreating: "开始创作",
    settings: "设置",
    cancel: "取消",
    create: "创建",
    export: "导出",
    saving: "保存中...",
    exporting: "导出中...",
  },
  tools: {
    pencil: "铅笔",
    eraser: "橡皮",
    fill: "填充",
    eyedropper: "取色",
    selection: "选区",
    line: "直线",
  },
  panels: {
    resources: "资源浏览器",
    tools: "工具",
    palette: "调色板",
    layers: "图层",
    brush: "笔刷",
    brushSize: "大小",
  },
  resources: {
    items: "物品",
    mobs: "怪物",
    npcs: "NPC",
    maps: "地图",
    search: "搜索资源...",
    placeholder: "连接 maplestory.io API 后显示资源",
  },
  canvas: {
    newCanvas: "新建画布",
    presetSize: "预设尺寸",
    width: "宽",
    height: "高",
  },
  timeline: {
    copy: "复制",
    delete: "删除",
    loop: "循环",
  },
  settings: {
    title: "设置",
    language: "语言",
    theme: "主题",
    gridSize: "网格大小",
    shortcuts: "快捷键",
  },
} as const;

export type ZhType = typeof zh;
```

- [ ] **Step 2: Create lib/i18n/en.ts**

```typescript
export const en = {
  common: {
    title: "Pixel Studio — Pixel Art Workshop",
    startCreating: "Start Creating",
    settings: "Settings",
    cancel: "Cancel",
    create: "Create",
    export: "Export",
    saving: "Saving...",
    exporting: "Exporting...",
  },
  tools: {
    pencil: "Pencil",
    eraser: "Eraser",
    fill: "Fill",
    eyedropper: "Eyedropper",
    selection: "Selection",
    line: "Line",
  },
  panels: {
    resources: "Resource Browser",
    tools: "Tools",
    palette: "Palette",
    layers: "Layers",
    brush: "Brush",
    brushSize: "Size",
  },
  resources: {
    items: "Items",
    mobs: "Mobs",
    npcs: "NPCs",
    maps: "Maps",
    search: "Search resources...",
    placeholder: "Resources appear after connecting to maplestory.io API",
  },
  canvas: {
    newCanvas: "New Canvas",
    presetSize: "Preset Size",
    width: "Width",
    height: "Height",
  },
  timeline: {
    copy: "Copy",
    delete: "Delete",
    loop: "Loop",
  },
  settings: {
    title: "Settings",
    language: "Language",
    theme: "Theme",
    gridSize: "Grid Size",
    shortcuts: "Shortcuts",
  },
} as const;

export type EnType = typeof en;
```

- [ ] **Step 3: Create lib/theme/maple.css**

```css
/* MapleStory pixel theme — additional utility styles */

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-primary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 0;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--accent);
}

/* Input range styling */
input[type="range"] {
  -webkit-appearance: none;
  height: 6px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  background: var(--accent);
  border: 2px solid var(--border-color);
  cursor: pointer;
}

input[type="number"] {
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Focus styles */
input:focus,
button:focus {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}

/* Pixel font class */
.font-pixel {
  font-family: "Press Start 2P", monospace;
}
```

- [ ] **Step 4: Create app/settings/page.tsx**

```tsx
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
```

- [ ] **Step 5: Commit**

```bash
git add app/settings/page.tsx lib/i18n/ lib/theme/
git commit -m "feat: add settings page, i18n translations, and MapleStory theme CSS"
```

---

### Task 9: Integrate and Polish

**Files:**
- Modify: `components/header/index.tsx` — add export and new canvas buttons
- Modify: `app/canvas/page.tsx` — integrate modals
- Add: keyboard shortcuts via useEffect

- [ ] **Step 1: Update components/header/index.tsx**

Replace the existing header content with:

```tsx
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
```

- [ ] **Step 2: Add keyboard shortcuts to app/canvas/page.tsx**

Add this to the CanvasPage component:

```tsx
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
```

- [ ] **Step 3: Run dev server and test**

```bash
npm run dev
```

Open http://localhost:3000 and verify:
- Landing page renders with pixel theme
- Canvas page shows full layout (left sidebar, canvas, right sidebar, timeline)
- Pencil tool draws pixels on canvas
- Eraser tool erases pixels
- Fill tool floods area
- Layer add/remove works
- Frame add/delete/duplicate works
- Playback animates between frames
- Export modal shows and exports PNG
- New canvas modal allows resizing
- Language toggle works on settings page

- [ ] **Step 4: Run build**

```bash
npm run build
```

Expected: Build succeeds with no errors or warnings.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: integrate all components, add keyboard shortcuts and modals"
```

---

### Task 10: History System (Undo/Redo)

**Files:**
- Create: `lib/canvas/history.ts`
- Modify: `lib/store/pixel-store.ts` — integrate history

- [ ] **Step 1: Create lib/canvas/history.ts**

```typescript
export interface Command {
  execute(): void;
  undo(): void;
}

export class HistoryManager {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private maxSize: number;

  constructor(maxSize: number = 50) {
    this.maxSize = maxSize;
  }

  push(command: Command) {
    this.undoStack.push(command);
    if (this.undoStack.length > this.maxSize) {
      this.undoStack.shift();
    }
    this.redoStack = []; // Clear redo on new action
  }

  undo(): Command | null {
    const cmd = this.undoStack.pop();
    if (!cmd) return null;
    cmd.undo();
    this.redoStack.push(cmd);
    return cmd;
  }

  redo(): Command | null {
    const cmd = this.redoStack.pop();
    if (!cmd) return null;
    cmd.execute();
    this.undoStack.push(cmd);
    return cmd;
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }
}
```

- [ ] **Step 2: Update lib/store/pixel-store.ts**

Add history integration. Import `HistoryManager` and create a module-level instance. Wrap pixel mutations with commands. The key change is adding a `pushHistory()` method that snapshots the current layer state before mutation, and connecting undo/redo to restore snapshots.

```typescript
import { create } from "zustand";
import type { PixelState, Layer, Frame, ToolType } from "@/lib/types";
import { HistoryManager, Command } from "@/lib/canvas/history";

const generateId = () => Math.random().toString(36).slice(2, 9);

const history = new HistoryManager(50);

// Snapshot helper
function snapshotLayers(layers: Layer[]): Layer[] {
  return layers.map((l) => ({
    ...l,
    pixels: new Map(l.pixels),
  }));
}

function restoreLayers(
  currentLayers: Layer[],
  snapshot: Layer[]
): Layer[] {
  return snapshot.map((s) => ({
    ...s,
    pixels: new Map(s.pixels),
  }));
}

// ... (keep all existing store code, update undo/redo)
```

Replace the stub undo/redo in the store:

```typescript
// History
history: history,
undo: () => history.undo(),
redo: () => history.redo(),
canUndo: history.canUndo,
canRedo: history.canRedo,
```

And wrap `setPixel`, `clearPixel`, `floodFill`, `clearLayer` to push commands:

```typescript
setPixel: (x, y, color) =>
  set((state) => {
    if (x < 0 || x >= state.canvas.width || y < 0 || y >= state.canvas.height)
      return state;
    const layer = state.layers.find((l) => l.id === state.activeLayerId);
    if (!layer || layer.locked) return state;

    const oldPixels = snapshotLayers(state.layers);
    const key = `${x},${y}`;
    const oldColor = layer.pixels.get(key);

    const cmd: Command = {
      execute: () => {},
      undo: () => {
        set((s) => ({ layers: restoreLayers(s.layers, oldPixels) }));
      },
    };
    history.push(cmd);

    // ... rest of setPixel logic
  }),
```

- [ ] **Step 3: Commit**

```bash
git add lib/canvas/history.ts lib/store/pixel-store.ts
git commit -m "feat: add undo/redo history with command pattern"
```
