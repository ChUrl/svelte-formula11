import { browser } from "$app/environment";

/**
 * Obtain an onchange event handler that updates an <Avatar> component
 * with a new image uploaded via a file input element.
 */
export const get_avatar_preview_event_handler = (id: string): ((event: Event) => void) => {
  const handler = (event: Event): void => {
    const target: HTMLInputElement = event.target as HTMLInputElement;
    const files: FileList | null = target.files;

    if (files && files.length > 0) {
      const src: string = URL.createObjectURL(files[0]);
      const preview: HTMLImageElement = document.querySelector(
        `#${id} > img:first-of-type`,
      ) as HTMLImageElement;

      if (preview) {
        preview.src = src;
        preview.hidden = false;
      }
    }
  };

  return handler;
};

/**
 * Obtain an onchange event handler that updates an <img> element
 * with a new image uploaded via a file input element.
 */
export const get_image_preview_event_handler = (id: string): ((event: Event) => void) => {
  const handler = (event: Event): void => {
    const target: HTMLInputElement = event.target as HTMLInputElement;
    const files: FileList | null = target.files;

    if (files && files.length > 0) {
      const src: string = URL.createObjectURL(files[0]);
      const preview: HTMLImageElement = document.getElementById(id) as HTMLImageElement;

      if (preview) {
        preview.src = src;
        preview.hidden = false;
      }
    }
  };

  return handler;
};

/**
 * Convert a binary [Blob] to base64 string.
 * Can only be called clientside from a browser as it depends on FileReader!
 */
export const blob_to_base64 = (blob: Blob): Promise<string> => {
  if (!browser) {
    console.error("Can't call blob_to_base64 on server (FileReader is not available)!");
  }

  return new Promise((resolve, _) => {
    const reader = new FileReader();

    // This is fired once the file read has ended
    reader.onloadend = () => resolve(reader.result?.toString() ?? "");

    reader.readAsDataURL(blob);
  });
};

/**
 * Fetch an image from an URL using a fetch function [f] and return as base64 string .
 * Can be called client- and server-side.
 */
export const fetch_image_base64 = async (url: string, f: Function = fetch): Promise<string> => {
  if (browser) {
    return await f(url)
      .then((response: Response) => response.blob())
      .then((blob: Blob) => blob_to_base64(blob));
  }

  // On the server
  const response: Response = await f(url);
  const buffer: Buffer = Buffer.from(await response.arrayBuffer());
  return buffer.toString("base64");
};
