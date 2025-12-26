import {
  fetch_drivers,
  fetch_seasonpickresults,
  fetch_teams,
  fetch_users,
  fetch_visibleseasonpicks,
} from "$lib/fetch";
import type { PageLoad } from "../../$types";

export const load: PageLoad = async ({ fetch, depends }) => {
  depends("data:drivers", "data:seasonpickresults", "data:users", "data:seasonpicks", "data:teams");

  return {
    users: fetch_users(fetch),
    drivers: fetch_drivers(fetch),
    teams: fetch_teams(fetch),
    seasonpicks: fetch_visibleseasonpicks(fetch),
    seasonpickresults: fetch_seasonpickresults(fetch),
  };
};
