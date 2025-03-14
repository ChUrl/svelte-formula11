import { refresh_auth } from "$lib/pocketbase";
import type { ClientInit } from "@sveltejs/kit";

export const init: ClientInit = async () => {
  // Try to refresh the authStore. This is required when e.g.
  // changing e-mail address. The new e-mail will show up after
  // being verified, so the authStore has to be reloaded.
  try {
    await refresh_auth();
  } catch (error) {
    console.log("hooks.client.ts:", error);
  }
};
