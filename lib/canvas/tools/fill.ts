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
