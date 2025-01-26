import type { Driver, Race, RacePick, RaceResult } from "$lib/schema";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, locals }) => {
  const fetch_racepicks = async (): Promise<RacePick[]> => {
    // Don't expand race/pxx/dnf since we already fetched those
    const racepicks: RacePick[] = await locals.pb
      .collection("racepicks")
      .getFullList({ fetch: fetch, expand: "user" });

    // TODO: Fill in the expanded race pictogram_url fields

    return racepicks;
  };

  const fetch_currentrace = async (): Promise<Race | null> => {
    const currentrace: Race[] = await locals.pb.collection("currentrace").getFullList();

    // The currentrace collection either has a single or no entries
    if (currentrace.length == 0) return null;

    currentrace[0].pictogram_url = await locals.pb.files.getURL(
      currentrace[0],
      currentrace[0].pictogram,
    );

    return currentrace[0];
  };

  const fetch_raceresults = async (): Promise<RaceResult[]> => {
    // Don't expand races/pxxs/dnfs since we already fetched those
    const raceresults: RaceResult[] = await locals.pb.collection("raceresults").getFullList();

    return raceresults;
  };

  // TODO: Duplicated code from data/season/+layout.server.ts
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

  // TODO: Duplicated code from data/season/+layout.server.ts
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

  return {
    racepicks: await fetch_racepicks(),
    currentrace: await fetch_currentrace(),
    raceresults: await fetch_raceresults(),
    drivers: await fetch_drivers(),
    races: await fetch_races(),
  };
};
