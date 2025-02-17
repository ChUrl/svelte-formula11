import { pb, pbUser } from "$lib/pocketbase";

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
  const fetch_graphics = async (): Promise<Graphic[]> => {
    const graphics: Graphic[] = await pb.collection("graphics").getFullList({ fetch: fetch });

    graphics.map((graphic: Graphic) => {
      graphic.file_url = pb.files.getURL(graphic, graphic.file);
    });

    return graphics;
  };

  const fetch_teams = async (): Promise<Team[]> => {
    const teams: Team[] = await pb.collection("teams").getFullList({
      sort: "+name",
      fetch: fetch,
    });

    teams.map((team: Team) => {
      team.banner_url = pb.files.getURL(team, team.banner);
      team.logo_url = pb.files.getURL(team, team.logo);
    });

    return teams;
  };

  const fetch_drivers = async (): Promise<Driver[]> => {
    const drivers: Driver[] = await pb.collection("drivers").getFullList({
      sort: "+code",
      fetch: fetch,
    });

    drivers.map((driver: Driver) => {
      driver.headshot_url = pb.files.getURL(driver, driver.headshot);
    });

    return drivers;
  };

  const fetch_races = async (): Promise<Race[]> => {
    const races: Race[] = await pb.collection("races").getFullList({
      sort: "+step",
      fetch: fetch,
    });

    races.map((race: Race) => {
      race.pictogram_url = pb.files.getURL(race, race.pictogram);
    });

    return races;
  };

  const fetch_substitutions = async (): Promise<Substitution[]> => {
    const substitutions: Substitution[] = await pb.collection("substitutions").getFullList({
      expand: "race",
      fetch: fetch,
    });

    // Sort by race step (ascending)
    substitutions.sort(
      (a: Substitution, b: Substitution) => a.expand.race.step - b.expand.race.step,
    );

    return substitutions;
  };

  const fetch_raceresults = async (): Promise<RaceResult[]> => {
    const raceresults: RaceResult[] = await pb
      .collection("raceresultsdesc")
      .getFullList({ fetch: fetch });

    return raceresults;
  };

  return {
    // User information (synchronous)
    user: pbUser,
    admin: pbUser?.admin ?? false,

    // Return static data
    graphics: fetch_graphics(),
    teams: fetch_teams(),
    drivers: fetch_drivers(),
    races: fetch_races(),
    substitutions: fetch_substitutions(),

    // Return other data
    raceresults: fetch_raceresults(),
  };
};
