import { fetch_drivers, fetch_scraped_driverstandings } from "$lib/fetch";
import type { PageLoad } from "../../../$types";

export const load: PageLoad = async ({ fetch, depends }) => {
  depends("data:official", "data:drivers");

  return {
    scraped_driverstandings: fetch_scraped_driverstandings(fetch),
    drivers: fetch_drivers(fetch),
  };
};
