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
