/**
 * Image processing utilities for converting photos to pixel art.
 */

export interface PixelGrid {
  width: number;
  height: number;
  pixels: string[][]; // pixels[y][x] = "#RRGGBB" or "transparent"
}

/**
 * Load an image from File or URL into an HTMLImageElement.
 */
export function loadImage(source: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;

    if (source instanceof File) {
      img.src = URL.createObjectURL(source);
    } else {
      img.src = source;
    }
  });
}

/**
 * Downsample an image to the target grid size.
 *
 * Algorithm:
 * 1. Draw image onto offscreen canvas at target resolution
 * 2. Read pixel data with getImageData
 * 3. Each pixel becomes the average color of the source region
 */
export function imageToPixelGrid(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number
): PixelGrid {
  const offscreen = document.createElement("canvas");
  offscreen.width = targetWidth;
  offscreen.height = targetHeight;
  const ctx = offscreen.getContext("2d")!;

  // Use imageSmoothingEnabled=false for blocky pixel art style
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const data = imageData.data;

  const pixels: string[][] = [];
  for (let y = 0; y < targetHeight; y++) {
    const row: string[] = [];
    for (let x = 0; x < targetWidth; x++) {
      const i = (y * targetWidth + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a < 128) {
        row.push("transparent");
      } else {
        row.push(`#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`);
      }
    }
    pixels.push(row);
  }

  return { width: targetWidth, height: targetHeight, pixels };
}

/**
 * Quantize colors to reduce palette (optional post-processing step).
 * Rounds each RGB channel to nearest multiple of step.
 */
export function quantizeColors(pixels: string[][], step: number = 32): string[][] {
  return pixels.map((row) =>
    row.map((color) => {
      if (color === "transparent") return color;
      const hex = color.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      const qr = Math.round(r / step) * step;
      const qg = Math.round(g / step) * step;
      const qb = Math.round(b / step) * step;

      return `#${qr.toString(16).padStart(2, "0")}${qg.toString(16).padStart(2, "0")}${qb.toString(16).padStart(2, "0")}`;
    })
  );
}
