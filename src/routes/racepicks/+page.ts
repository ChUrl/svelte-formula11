import { fetch_currentpickedusers, fetch_currentrace, fetch_racepicks } from "$lib/fetch";
import type { PageLoad } from "../$types";

export const load: PageLoad = async ({ fetch }) => {
  return {
    racepicks: fetch_racepicks(fetch),
    currentpickedusers: fetch_currentpickedusers(fetch),

    currentrace: await fetch_currentrace(fetch),
  };
};
