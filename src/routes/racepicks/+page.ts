import {
  fetch_currentpickedusers,
  fetch_currentrace,
  fetch_drivers,
  fetch_racepicks,
  fetch_raceresults,
  fetch_races,
} from "$lib/fetch";
import type { PageLoad } from "../$types";

export const load: PageLoad = async ({ fetch }) => {
  return {
    racepicks: fetch_racepicks(fetch),
    currentpickedusers: fetch_currentpickedusers(fetch),
    raceresults: fetch_raceresults(fetch),
    drivers: fetch_drivers(fetch),
    races: fetch_races(fetch),

    currentrace: await fetch_currentrace(fetch),
  };
};
