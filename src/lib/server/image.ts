import sharp from "sharp";

/**
 * Convert any [ArrayBuffer] containing image data to an [avif] [Blob].
 * Also allows downscaling and lossy compression.
 * Set either [width] or [height] to downscale while keeping the aspect ratio.
 */
export const image_to_avif = async (
  data: ArrayBuffer,
  width: number | undefined = undefined,
  height: number | undefined = undefined,
  quality: number = 50,
  effort: number = 4,
): Promise<Blob> => {
  const compressed: Buffer = await sharp(data)
    .resize(width, height)
    .avif({ quality: quality, effort: effort })
    .toBuffer();

  console.log(`image_to_avif: ${data.byteLength} Bytes -> ${compressed.length} Bytes`);

  return new Blob([compressed]);
};
