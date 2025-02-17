import { image_to_avif } from "$lib/server/image";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

/**
 * This route is available at /api/compress.
 * It will return the image as a compressed [avif] [Blob].
 * We need this because [sharp] is a server-side node library.
 */
export const POST: RequestHandler = async ({ request }) => {
  console.log("Hit /api/compress...");
  const data: FormData = await request.formData();

  const image: File | undefined = data.has("image") ? (data.get("image") as File) : undefined;
  const width: number | undefined = data.has("width")
    ? parseInt(data.get("width")?.toString() ?? "-1")
    : undefined;
  const height: number | undefined = data.has("height")
    ? parseInt(data.get("height")?.toString() ?? "-1")
    : undefined;
  const quality: number | undefined = data.has("quality")
    ? parseInt(data.get("quality")?.toString() ?? "-1")
    : undefined;
  const effort: number | undefined = data.has("effort")
    ? parseInt(data.get("effort")?.toString() ?? "-1")
    : undefined;

  if (!image) {
    error(500, "Can't compress image without image data");
  }

  const compressedImage: Blob = await image_to_avif(
    await image.arrayBuffer(),
    width,
    height,
    quality,
    effort,
  );

  return new Response(compressedImage, {
    headers: {
      "Content-Type": "image/avif",
    },
  });
};
