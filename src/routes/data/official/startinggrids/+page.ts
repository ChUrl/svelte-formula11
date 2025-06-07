import { fetch_drivers, fetch_races, fetch_scraped_startinggrids } from "$lib/fetch";
import type { PageLoad } from "../../../$types";

export const load: PageLoad = async ({ fetch, depends }) => {
  depends("data:official", "data:races", "data:drivers");

  return {
    scraped_startinggrids: fetch_scraped_startinggrids(fetch),
    races: fetch_races(fetch),
    drivers: fetch_drivers(fetch),
  };
};
