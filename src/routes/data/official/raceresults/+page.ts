import { fetch_drivers, fetch_races, fetch_scraped_raceresults } from "$lib/fetch";
import type { PageLoad } from "../../../$types";

export const load: PageLoad = async ({ fetch, depends }) => {
  depends("data:scraped_raceresults", "data:races", "data:drivers");

  return {
    scraped_raceresults: fetch_scraped_raceresults(fetch),
    races: fetch_races(fetch),
    drivers: fetch_drivers(fetch),
  };
};
