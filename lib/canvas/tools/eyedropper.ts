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
