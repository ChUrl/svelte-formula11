import {
  fetch_users,
  fetch_racepickpoints,
  fetch_racepickpointsacc,
  fetch_racepickpointstotal,
  fetch_seasonpickpoints,
} from "$lib/fetch";
import type { PageLoad } from "../$types";

export const load: PageLoad = async ({ fetch, depends }) => {
  depends("data:users", "data:raceresults", "data:seasonpickresults");

  return {
    users: fetch_users(fetch),
    racepickpoints: fetch_racepickpoints(fetch),
    racepickpointsacc: fetch_racepickpointsacc(fetch),
    racepickpointstotal: fetch_racepickpointstotal(fetch),
    seasonpickpoints: fetch_seasonpickpoints(fetch),
  };
};
