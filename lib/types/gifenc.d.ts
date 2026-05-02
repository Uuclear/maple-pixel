declare module "gifenc" {
  export interface GIFEncoder {
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      palette: Uint8Array,
      options?: { delay?: number }
    ): void;
    finish(): Blob;
  }

  export function GIFEncoder(): GIFEncoder;
  export function quantize(data: Uint8Array | Uint8ClampedArray, maxColors: number): Uint8Array;
  export function applyPalette(data: Uint8Array | Uint8ClampedArray, palette: Uint8Array): Uint8Array;
}
