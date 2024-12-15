import { form_data_clean, form_data_ensure_keys, form_data_get_and_remove_id } from "$lib/form";
import { error, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { image_to_avif } from "$lib/server/image";

export const actions = {
  create_profile: async ({ request, locals }): Promise<void> => {
    const data: FormData = form_data_clean(await request.formData());
    form_data_ensure_keys(data, ["username", "password", "redirect_url"]);

    // Confirm password lol
    await locals.pb.collection("users").create({
      username: data.get("username")?.toString(),
      password: data.get("password")?.toString(),
      passwordConfirm: data.get("password")?.toString(),
      admin: false,
    });

    // Directly login after registering
    await locals.pb
      .collection("users")
      .authWithPassword(data.get("username")?.toString(), data.get("password")?.toString());

    redirect(303, data.get("redirect_url")?.toString() ?? "/");
  },

  // TODO: PocketBase API rule: Only the active user should be able to modify itself
  update_profile: async ({ request, locals }): Promise<void> => {
    const data: FormData = form_data_clean(await request.formData());
    form_data_ensure_keys(data, ["redirect_url"]);
    const id: string = form_data_get_and_remove_id(data);

    if (data.has("avatar")) {
      // Compress image
      const compressed: Blob = await image_to_avif(
        await (data.get("avatar") as File).arrayBuffer(),
        256,
        256,
      );

      // At most 20kB
      if (compressed.size > 20000) {
        error(400, "Avatar too large!");
      }

      data.set("avatar", compressed);
    }

    await locals.pb.collection("users").update(id, data);

    redirect(303, data.get("redirect_url")?.toString() ?? "/");
  },

  login: async ({ request, locals }) => {
    if (locals.user) {
      error(400, "Already logged in!");
    }

    const data: FormData = form_data_clean(await request.formData());
    form_data_ensure_keys(data, ["username", "password", "redirect_url"]);

    try {
      await locals.pb
        .collection("users")
        .authWithPassword(data.get("username")?.toString(), data.get("password")?.toString());
    } catch (err) {
      error(400, "Failed to login!");
    }

    redirect(303, data.get("redirect_url")?.toString() ?? "/");
  },

  logout: async ({ request, locals }) => {
    if (!locals.user) {
      error(400, "Not logged in!");
    }

    const data: FormData = form_data_clean(await request.formData());
    form_data_ensure_keys(data, ["redirect_url"]);

    locals.pb.authStore.clear();
    locals.user = undefined;

    redirect(303, data.get("redirect_url")?.toString() ?? "/");
  },
} satisfies Actions;
