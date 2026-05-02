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
