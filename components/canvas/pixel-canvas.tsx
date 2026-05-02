"use client";

import { useRef, useEffect, useCallback } from "react";
import { usePixelStore } from "@/lib/store/pixel-store";
import { renderCanvas } from "@/lib/canvas/renderer";
import { screenToGrid, calculatePixelSize } from "@/lib/canvas/engine";

export function PixelCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const lastPixel = useRef<{ x: number; y: number } | null>(null);

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
      el.clientWidth || 100,
      el.clientHeight || 100,
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

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    lastPixel.current = null;
    applyTool(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    // For pencil and eraser, apply on drag
    if (currentTool === "pencil" || currentTool === "eraser") {
      applyTool(e);
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    lastPixel.current = null;
  };

  const applyTool = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getGridCoords(e);

    // Avoid redundant operations on same pixel
    if (lastPixel.current?.x === x && lastPixel.current?.y === y) return;
    lastPixel.current = { x, y };

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
      case "eyedropper": {
        // Pick color from topmost visible layer
        for (let i = layers.length - 1; i >= 0; i--) {
          const layer = layers[i];
          if (!layer.visible) continue;
          const color = layer.pixels.get(`${x},${y}`);
          if (color) {
            usePixelStore.getState().setColor(color);
          }
        }
        break;
      }
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
