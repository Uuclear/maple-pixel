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
 * Full render pipeline: clear -> checkerboard -> layers -> grid.
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
