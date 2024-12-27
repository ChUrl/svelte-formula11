import type { Team, Driver, Race, Substitution, Graphic } from "$lib/schema";
import type { LayoutServerLoad } from "./$types";

// This "load" function runs serverside only, as it's located inside +layout.server.ts
export const load: LayoutServerLoad = async ({ fetch, locals }) => {
  const fetch_graphics = async (): Promise<Graphic[]> => {
    const graphics: Graphic[] = await locals.pb
      .collection("graphics")
      .getFullList({ fetch: fetch });

    graphics.map((graphic: Graphic) => {
      graphic.file_url = locals.pb.files.getURL(graphic, graphic.file);
    });

    return graphics;
  };

  const fetch_teams = async (): Promise<Team[]> => {
    const teams: Team[] = await locals.pb.collection("teams").getFullList({
      sort: "+name",
      fetch: fetch,
    });

    teams.map((team: Team) => {
      team.banner_url = locals.pb.files.getURL(team, team.banner);
      team.logo_url = locals.pb.files.getURL(team, team.logo);
    });

    return teams;
  };

  const fetch_drivers = async (): Promise<Driver[]> => {
    const drivers: Driver[] = await locals.pb.collection("drivers").getFullList({
      sort: "+code",
      fetch: fetch,
    });

    drivers.map((driver: Driver) => {
      driver.headshot_url = locals.pb.files.getURL(driver, driver.headshot);
    });

    return drivers;
  };

  const fetch_races = async (): Promise<Race[]> => {
    const races: Race[] = await locals.pb.collection("races").getFullList({
      sort: "+step",
      fetch: fetch,
    });

    races.map((race: Race) => {
      race.pictogram_url = locals.pb.files.getURL(race, race.pictogram);
    });

    return races;
  };

  const fetch_substitutions = async (): Promise<Substitution[]> => {
    // TODO: Sort by race step (does the race need to be expanded for this?)
    const substitutions: Substitution[] = await locals.pb.collection("substitutions").getFullList({
      fetch: fetch,
    });

    return substitutions;
  };

  return {
    // Graphics and teams are awaited, since those are visible on page load.
    graphics: await fetch_graphics(),
    teams: await fetch_teams(),

    // The rest is streamed gradually, since the user has to switch tabs to need them.
    drivers: fetch_drivers(),
    races: fetch_races(),
    substitutions: fetch_substitutions(),
  };
};
