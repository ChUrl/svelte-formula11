import { fetch_drivers, fetch_races, fetch_substitutions } from "$lib/fetch";
import type { PageLoad } from "../../../$types";

export const load: PageLoad = async ({ fetch }) => {
  return {
    races: fetch_races(fetch),
    drivers: fetch_drivers(fetch),
    substitutions: fetch_substitutions(fetch),
  };
};
