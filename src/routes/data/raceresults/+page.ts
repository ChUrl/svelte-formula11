import { fetch_drivers, fetch_raceresults, fetch_races } from "$lib/fetch";
import type { PageLoad } from "../../$types";

export const load: PageLoad = async ({ fetch }) => {
  return {
    drivers: fetch_drivers(fetch),
    races: fetch_races(fetch),
    raceresults: fetch_raceresults(fetch),
  };
};
