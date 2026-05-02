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
