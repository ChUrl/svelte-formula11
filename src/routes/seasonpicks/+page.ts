import { fetch_drivers, fetch_seasonpickedusers, fetch_seasonpicks, fetch_teams } from "$lib/fetch";
import type { PageLoad } from "../$types";

export const load: PageLoad = async ({ fetch, depends }) => {
  depends("data:teams", "data:drivers", "data:seasonpicks");

  return {
    teams: fetch_teams(fetch),
    drivers: fetch_drivers(fetch),
    seasonpicks: fetch_seasonpicks(fetch),
    seasonpickedusers: fetch_seasonpickedusers(fetch),
  };
};
