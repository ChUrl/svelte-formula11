import {
  fetch_drivers,
  fetch_scraped_driverstandings,
  fetch_scraped_raceresults,
  fetch_scraped_raceresultsacc,
  fetch_scraped_startinggrids,
  fetch_scraped_teamstandings,
} from "$lib/fetch";
import type { PageLoad } from "../$types";

export const load: PageLoad = async ({ fetch, depends }) => {
  depends("data:drivers", "data:official");

  return {
    drivers: fetch_drivers(fetch),

    scraped_driverstandings: fetch_scraped_driverstandings(fetch),
    scraped_teamstandings: fetch_scraped_teamstandings(fetch),
    scraped_startinggrids: fetch_scraped_startinggrids(fetch),
    scraped_raceresults: fetch_scraped_raceresults(fetch),
    scraped_raceresultsacc: fetch_scraped_raceresultsacc(fetch),
  };
};
