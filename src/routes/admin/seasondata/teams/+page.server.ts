import type { Actions, PageServerLoad } from "./$types";
import {
  form_data_clean,
  form_data_ensure_keys,
  form_data_get_and_remove_id,
} from "$lib/forms";

// These "actions" run serverside only, as they're located inside +page.server.ts
export const actions = {
  // We destructure the RequestEvent with ({cookies, request}).
  // Alternatively use (event) and event.cookies or event.request to access.
  create: async ({ cookies, request, locals }) => {
    if (!locals.admin) return { success: false };

    const data = form_data_clean(await request.formData());
    form_data_ensure_keys(data, ["name", "logo"]);

    const record = await locals.pb.collection("teams").create(data);

    return { success: true };
  },

  update: async ({ cookies, request, locals }) => {
    if (!locals.admin) return { success: false };

    const data = form_data_clean(await request.formData());
    const id = form_data_get_and_remove_id(data);

    // Destructure the FormData object
    const record = await locals.pb.collection("teams").update(id, data);

    return { success: true };
  },

  delete: async ({ cookies, request, locals }) => {
    if (!locals.admin) return { success: false };

    const data: FormData = form_data_clean(await request.formData());
    const id = form_data_get_and_remove_id(data);

    await locals.pb.collection("teams").delete(id);

    return { success: true };
  },
} satisfies Actions;

// This "load" function runs serverside only, as it's located inside +page.server.ts
export const load: PageServerLoad = async ({ fetch, locals }) => {
  const fetch_teams = async () => {
    const teams = await locals.pb.collection("teams").getFullList({
      sort: "+name",
      fetch: fetch,
    });

    // Fill in the file URLs
    teams.map((team) => {
      team.logo_url = locals.pb.files.getURL(team, team.logo);
    });

    return teams;
  };

  return {
    teams: await fetch_teams(),
  };
};
