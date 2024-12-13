import { form_data_clean, form_data_ensure_keys, form_data_get_and_remove_id } from "$lib/form";
import { error, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions = {
  create_profile: async ({ request, locals }) => {
    const data = form_data_clean(await request.formData());
    form_data_ensure_keys(data, ["username", "password"]);

    // TODO: Errrr passwordConfirm... How to integrate it into the unified login-/register-UI?
    const record = await locals.pb.collection("users").create({
      username: data.get("username")?.toString(),
      password: data.get("password")?.toString(),
      passwordConfirm: data.get("password")?.toString(),
      admin: false,
    });

    // Directly login after registering
    await locals.pb
      .collection("users")
      .authWithPassword(data.get("username")?.toString(), data.get("password")?.toString());

    redirect(303, "/");
  },

  // TODO: PocketBase API rule: Only the active user should be able to modify itself
  update_profile: async ({ request, locals }) => {
    const data = form_data_clean(await request.formData());
    const id = form_data_get_and_remove_id(data);

    const record = await locals.pb.collection("users").update(id, data);

    redirect(303, "/");
  },

  login: async ({ request, locals }) => {
    if (locals.user) {
      console.log("Already logged in!");
      return;
    }

    const data = form_data_clean(await request.formData());
    form_data_ensure_keys(data, ["username", "password"]);

    try {
      await locals.pb
        .collection("users")
        .authWithPassword(data.get("username")?.toString(), data.get("password")?.toString());
    } catch (err) {
      console.log(`Failed to login: ${err}`);
      error(400, "Failed to login!");
    }

    // TODO: Would be better to redirect to previous page somehow...
    redirect(303, "/");
  },

  logout: async ({ locals }) => {
    locals.pb.authStore.clear();
    locals.user = undefined;

    // TODO: Would be better to redirect to previous page somehow...
    redirect(303, "/");
  },
} satisfies Actions;
