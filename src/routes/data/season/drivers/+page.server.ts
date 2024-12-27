import { DRIVER_HEADSHOT_HEIGHT, DRIVER_HEADSHOT_WIDTH } from "$lib/config";
import { form_data_clean, form_data_ensure_keys, form_data_get_and_remove_id } from "$lib/form";
import { image_to_avif } from "$lib/server/image";
import type { Actions } from "@sveltejs/kit";

export const actions = {
  create_driver: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    const data: FormData = form_data_clean(await request.formData());
    form_data_ensure_keys(data, ["firstname", "lastname", "code", "team", "headshot"]);

    // The toggle switch will report "on" or nothing
    data.set("active", data.has("active") ? "true" : "false");

    // Compress headshot
    const headshot_avif: Blob = await image_to_avif(
      await (data.get("headshot") as File).arrayBuffer(),
      DRIVER_HEADSHOT_WIDTH,
      DRIVER_HEADSHOT_HEIGHT,
    );

    data.set("headshot", headshot_avif);

    await locals.pb.collection("drivers").create(data);
  },

  update_driver: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    const data: FormData = form_data_clean(await request.formData());
    const id: string = form_data_get_and_remove_id(data);

    // The toggle switch will report "on" or nothing
    data.set("active", data.has("active") ? "true" : "false");

    if (data.has("headshot")) {
      // Compress headshot
      const headshot_avif: Blob = await image_to_avif(
        await (data.get("headshot") as File).arrayBuffer(),
        DRIVER_HEADSHOT_WIDTH,
        DRIVER_HEADSHOT_HEIGHT,
      );

      data.set("headshot", headshot_avif);
    }

    await locals.pb.collection("drivers").update(id, data);
  },

  delete_driver: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    const data: FormData = form_data_clean(await request.formData());
    const id: string = form_data_get_and_remove_id(data);

    await locals.pb.collection("drivers").delete(id);
  },
} satisfies Actions;
