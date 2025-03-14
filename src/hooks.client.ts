import { refresh_auth } from "$lib/pocketbase";
import type { ClientInit } from "@sveltejs/kit";

export const init: ClientInit = async () => {
  // NOTE: If the auth token is invalidated, this will block the entire page
  // await refresh_auth();
};
