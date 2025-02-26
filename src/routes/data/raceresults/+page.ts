import { fetch_drivers, fetch_raceresults, fetch_races, fetch_substitutions } from "$lib/fetch";
import type { PageLoad } from "../../$types";

export const load: PageLoad = async ({ fetch, depends }) => {
  depends("data:drivers", "data:races", "data:raceresults");

  return {
    drivers: fetch_drivers(fetch),
    races: fetch_races(fetch),
    raceresults: fetch_raceresults(fetch),
    substitutions: fetch_substitutions(fetch),
  };
};
