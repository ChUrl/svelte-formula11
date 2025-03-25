import {
  fetch_currentpickedusers,
  fetch_currentrace,
  fetch_drivers,
  fetch_visibleracepicks,
  fetch_raceresults,
  fetch_races,
  fetch_substitutions,
  fetch_currentracepick,
} from "$lib/fetch";
import type { PageLoad } from "../$types";

export const load: PageLoad = async ({ fetch, depends }) => {
  depends(
    "data:user",
    "data:racepicks",
    "data:users",
    "data:raceresults",
    "data:drivers",
    "data:races",
    "data:substitutions",
  );

  return {
    racepicks: fetch_visibleracepicks(fetch),
    currentpickedusers: fetch_currentpickedusers(fetch),
    raceresults: fetch_raceresults(fetch),
    drivers: fetch_drivers(fetch),
    races: fetch_races(fetch),
    substitutions: fetch_substitutions(fetch),

    currentrace: await fetch_currentrace(fetch),
    racepick: await fetch_currentracepick(fetch),
  };
};
