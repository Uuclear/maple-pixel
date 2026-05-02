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
