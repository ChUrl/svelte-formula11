import { fetch_races } from "$lib/fetch";
import type { PageLoad } from "../../../$types";

export const load: PageLoad = async ({ fetch, depends }) => {
  depends("data:races");

  return {
    races: fetch_races(fetch),
  };
};
