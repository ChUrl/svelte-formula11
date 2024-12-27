import { RACE_PICTOGRAM_HEIGHT, RACE_PICTOGRAM_WIDTH } from "$lib/config";
import {
  form_data_clean,
  form_data_ensure_keys,
  form_data_fix_dates,
  form_data_get_and_remove_id,
} from "$lib/form";
import { image_to_avif } from "$lib/server/image";
import type { Actions } from "@sveltejs/kit";

export const actions = {
  create_race: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    const data: FormData = form_data_clean(await request.formData());
    form_data_ensure_keys(data, ["name", "step", "pictogram", "pxx", "qualidate", "racedate"]);
    form_data_fix_dates(data, ["sprintqualidate", "sprintdate", "qualidate", "racedate"]);

    // Compress pictogram
    const pictogram_avif: Blob = await image_to_avif(
      await (data.get("pictogram") as File).arrayBuffer(),
      RACE_PICTOGRAM_WIDTH,
      RACE_PICTOGRAM_HEIGHT,
    );

    data.set("pictogram", pictogram_avif);

    await locals.pb.collection("races").create(data);
  },

  update_race: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    // Do not remove empty sprint dates so they can be cleared by updating the record
    const data: FormData = form_data_clean(await request.formData(), [
      "sprintqualidate",
      "sprintdate",
    ]);
    form_data_fix_dates(data, ["sprintqualidate", "sprintdate", "qualidate", "racedate"]);
    const id: string = form_data_get_and_remove_id(data);

    if (data.has("pictogram")) {
      // Compress pictogram
      const pictogram_avif: Blob = await image_to_avif(
        await (data.get("pictogram") as File).arrayBuffer(),
        RACE_PICTOGRAM_WIDTH,
        RACE_PICTOGRAM_HEIGHT,
      );

      data.set("pictogram", pictogram_avif);
    }

    await locals.pb.collection("races").update(id, data);
  },

  delete_race: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    const data: FormData = form_data_clean(await request.formData());
    const id: string = form_data_get_and_remove_id(data);

    await locals.pb.collection("races").delete(id);
  },
} satisfies Actions;
