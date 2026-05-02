import { create } from "zustand";
import type { PixelState, Layer, Frame, ToolType } from "@/lib/types";

const generateId = () => Math.random().toString(36).slice(2, 9);

const createLayer = (name: string): Layer => ({
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
  const initialLayer = createLayer("Layer 1");
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
          `Layer ${state.layers.length + 1}`
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
        const queue: [number, number][] = [[startX, startY]];
        const visited = new Set<string>();
        visited.add(key);

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

    // History (stub — will be enhanced in Task 10)
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
