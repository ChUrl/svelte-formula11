import { fetch_drivers, fetch_teams } from "$lib/fetch";
import type { PageLoad } from "../../../$types";

export const load: PageLoad = async ({ fetch, depends }) => {
  depends("data:teams", "data:drivers");

  return {
    teams: fetch_teams(fetch),
    drivers: fetch_drivers(fetch),
  };
};
