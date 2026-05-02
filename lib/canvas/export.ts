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
