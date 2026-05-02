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
