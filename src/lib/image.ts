export const get_image_preview_event_handler = (id: string) => {
  const handler = (event) => {
    const target = event.target;
    const files = target.files;

    if (files.length > 0) {
      const src = URL.createObjectURL(files[0]);
      const preview = document.getElementById(id) as HTMLImageElement;
      if (preview) {
        preview.src = src;
        preview.hidden = false;
      }
    }
  };

  return handler;
};
