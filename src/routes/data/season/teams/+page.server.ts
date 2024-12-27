import type { Actions } from "./$types";
import { form_data_clean, form_data_ensure_keys, form_data_get_and_remove_id } from "$lib/form";
import { image_to_avif } from "$lib/server/image";
import {
  TEAM_BANNER_HEIGHT,
  TEAM_BANNER_WIDTH,
  TEAM_LOGO_HEIGHT,
  TEAM_LOGO_WIDTH,
} from "$lib/config";

export const actions = {
  create_team: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    const data: FormData = form_data_clean(await request.formData());
    form_data_ensure_keys(data, ["name", "banner", "logo", "color"]);

    // Compress banner
    const banner_avif: Blob = await image_to_avif(
      await (data.get("banner") as File).arrayBuffer(),
      TEAM_BANNER_WIDTH,
      TEAM_BANNER_HEIGHT,
    );
    data.set("banner", banner_avif);

    // Compress logo
    const logo_avif: Blob = await image_to_avif(
      await (data.get("logo") as File).arrayBuffer(),
      TEAM_LOGO_WIDTH,
      TEAM_LOGO_HEIGHT,
    );
    data.set("logo", logo_avif);

    await locals.pb.collection("teams").create(data);
  },

  update_team: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    const data: FormData = form_data_clean(await request.formData());
    const id: string = form_data_get_and_remove_id(data);

    if (data.has("banner")) {
      // Compress banner
      const banner_avif: Blob = await image_to_avif(
        await (data.get("banner") as File).arrayBuffer(),
        TEAM_BANNER_WIDTH,
        TEAM_BANNER_HEIGHT,
      );
      data.set("banner", banner_avif);
    }

    if (data.has("logo")) {
      // Compress logo
      const logo_avif: Blob = await image_to_avif(
        await (data.get("logo") as File).arrayBuffer(),
        TEAM_LOGO_WIDTH,
        TEAM_LOGO_HEIGHT,
      );
      data.set("logo", logo_avif);
    }

    await locals.pb.collection("teams").update(id, data);
  },

  delete_team: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    const data: FormData = form_data_clean(await request.formData());
    const id: string = form_data_get_and_remove_id(data);

    await locals.pb.collection("teams").delete(id);
  },
} satisfies Actions;
