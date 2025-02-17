import {
  fetch_currentpickedusers,
  fetch_currentrace,
  fetch_drivers,
  fetch_racepicks,
  fetch_raceresults,
  fetch_races,
  fetch_substitutions,
} from "$lib/fetch";
import type { PageLoad } from "../$types";

export const load: PageLoad = async ({ fetch, depends }) => {
  depends(
    "data:racepicks",
    "data:currentpickedusers",
    "data:raceresults",
    "data:drivers",
    "data:races",
    "data:currentrace",
  );

  return {
    racepicks: fetch_racepicks(fetch),
    currentpickedusers: fetch_currentpickedusers(fetch),
    raceresults: fetch_raceresults(fetch),
    drivers: fetch_drivers(fetch),
    races: fetch_races(fetch),
    substitutions: fetch_substitutions(fetch),

    currentrace: await fetch_currentrace(fetch),
  };
};
