import { fetch_teams } from "$lib/fetch";
import type { PageLoad } from "../../../$types";

export const load: PageLoad = async ({ fetch }) => {
  return {
    teams: fetch_teams(fetch),
  };
};
