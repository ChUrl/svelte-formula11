import { fetch_users } from "$lib/fetch";
import type { PageLoad } from "../../$types";

export const load: PageLoad = async ({ fetch, depends }) => {
  depends("data:users");

  return {
    users: await fetch_users(fetch),
  };
};
