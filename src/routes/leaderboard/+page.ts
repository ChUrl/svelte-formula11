import {
  fetch_users,
  fetch_racepickpoints,
  fetch_racepickpointsacc,
  fetch_racepickpointstotal,
} from "$lib/fetch";
import type { PageLoad } from "../$types";

export const load: PageLoad = async ({ fetch, depends }) => {
  depends("data:users", "data:raceresults");

  return {
    users: fetch_users(fetch),
    racepickpoints: fetch_racepickpoints(fetch),
    racepickpointsacc: fetch_racepickpointsacc(fetch),
    racepickpointstotal: fetch_racepickpointstotal(fetch),
  };
};
