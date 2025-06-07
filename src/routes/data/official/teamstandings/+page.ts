import { fetch_scraped_teamstandings, fetch_teams } from "$lib/fetch";
import type { PageLoad } from "../../../$types";

export const load: PageLoad = async ({ fetch, depends }) => {
  depends("data:official", "data:teams");

  return {
    scraped_teamstandings: fetch_scraped_teamstandings(fetch),
    teams: fetch_teams(fetch),
  };
};
