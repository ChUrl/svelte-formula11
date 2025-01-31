import type { Driver, Race, RaceResult } from "$lib/schema";
import type { Actions, PageServerLoad } from "./$types";

export const actions = {} as Actions;

export const load: PageServerLoad = async ({ fetch, locals }) => {
  // TODO: Duplicated code from racepicks/+page.server.ts
  const fetch_raceresults = async (): Promise<RaceResult[]> => {
    const raceresults: RaceResult[] = await locals.pb.collection("raceresultsdesc").getFullList();

    return raceresults;
  };

  // TODO: Duplicated code from data/season/+layout.server.ts and racepicks/+page.server.ts
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

  // TODO: Duplicated code from data/season/+layout.server.ts and racepicks/+page.server.ts
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

  return {
    results: await fetch_raceresults(),
    races: await fetch_races(),
    drivers: await fetch_drivers(),
  };
};
