import sharp from "sharp";

/**
 * Convert any [ArrayBuffer] containing image data to an [avif] [Blob].
 * Also allows downscaling and lossy compression.
 * Set either [width] or [height] to downscale while keeping the aspect ratio.
 */
export const image_to_avif = async (
  data: ArrayBuffer,
  width?: number,
  height?: number,
  quality: number = 50,
  effort: number = 4,
): Promise<Blob> => {
  console.log(
    `Compressing ${data.byteLength} Bytes to ${width ?? -1}x${height ?? -1} avif with quality ${quality} and effort ${effort}...`,
  );

  const compressed: Buffer = await sharp(data)
    .resize(width, height)
    .avif({ quality: quality, effort: effort })
    .toBuffer();

  console.log(`Compressed ${data.byteLength} Bytes to ${compressed.length} Bytes`);

  return new Blob([compressed]);
};
