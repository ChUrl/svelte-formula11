import { fetch_races } from "$lib/fetch";
import type { PageLoad } from "../../../$types";

export const load: PageLoad = async ({ fetch }) => {
  return {
    races: fetch_races(fetch),
  };
};
