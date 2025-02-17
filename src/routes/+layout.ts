import {
  fetch_drivers,
  fetch_graphics,
  fetch_raceresults,
  fetch_races,
  fetch_substitutions,
  fetch_teams,
} from "$lib/fetch";
import { pbUser } from "$lib/pocketbase";

// This makes the page client-side rendered
export const ssr = false;

import type { Driver, Graphic, Race, RaceResult, Substitution, Team } from "$lib/schema";
import type { LayoutLoad } from "./$types";

// On each page load (every route), this function runs serverside.
// The "locals.user" object is only available on the server,
// since it's populated inside hooks.server.ts per request.
// It will populate the "user" attribute of each page's "data" object,
// so each page has access to the current user (or knows if no one is signed in).
export const load: LayoutLoad = () => {
  return {
    // User information (synchronous)
    user: pbUser,
    admin: pbUser?.admin ?? false,

    // Return static data
    graphics: fetch_graphics(fetch),
    teams: fetch_teams(fetch),
    drivers: fetch_drivers(fetch),
    races: fetch_races(fetch),
    substitutions: fetch_substitutions(fetch),

    // Return other data
    raceresults: fetch_raceresults(fetch),
  };
};
