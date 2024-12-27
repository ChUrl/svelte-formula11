import { form_data_clean, form_data_ensure_keys, form_data_get_and_remove_id } from "$lib/form";
import type { Actions } from "@sveltejs/kit";

export const actions = {
  create_substitution: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    const data: FormData = form_data_clean(await request.formData());
    form_data_ensure_keys(data, ["substitute", "for", "race"]);

    await locals.pb.collection("substitutions").create(data);
  },

  update_substitution: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    const data: FormData = form_data_clean(await request.formData());
    const id: string = form_data_get_and_remove_id(data);

    await locals.pb.collection("substitutions").update(id, data);
  },

  delete_substitution: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    const data: FormData = form_data_clean(await request.formData());
    const id: string = form_data_get_and_remove_id(data);

    await locals.pb.collection("substitutions").delete(id);
  },
} satisfies Actions;
