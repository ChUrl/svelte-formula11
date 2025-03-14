import {
  fetch_currentseasonpick,
  fetch_drivers,
  fetch_hottakes,
  fetch_seasonpickedusers,
  fetch_visibleseasonpicks,
  fetch_teams,
  fetch_currentrace,
} from "$lib/fetch";
import type { PageLoad } from "../$types";

export const load: PageLoad = async ({ fetch, depends }) => {
  depends("data:teams", "data:drivers", "data:seasonpicks", "data:user");

  return {
    teams: fetch_teams(fetch),
    drivers: fetch_drivers(fetch),
    seasonpicks: fetch_visibleseasonpicks(fetch),
    hottakes: fetch_hottakes(fetch),
    seasonpickedusers: fetch_seasonpickedusers(fetch),
    currentrace: fetch_currentrace(fetch), // Used for countdown

    seasonpick: await fetch_currentseasonpick(fetch),
  };
};
