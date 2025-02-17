import { fetch_users } from "$lib/fetch";
import type { PageLoad } from "../../$types";

export const load: PageLoad = async ({ fetch }) => {
  return {
    users: await fetch_users(fetch),
  };
};
