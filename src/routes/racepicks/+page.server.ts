import type { Driver, Race, RacePick, RaceResult } from "$lib/schema";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, locals }) => {
  const fetch_racepicks = async (): Promise<RacePick[]> => {
    // PXX/DNF is not expanded, as we have the drivers anyways (for guessing)
    const racepicks: RacePick[] = await locals.pb
      .collection("racepicks")
      .getFullList({ fetch: fetch, expand: "user,race" });

    return racepicks;
  };

  const fetch_currentrace = async (): Promise<Race | null> => {
    const currentrace: Race[] = await locals.pb.collection("currentrace").getFullList();

    // The currentrace collection either has a single or no entries
    return currentrace[0] ?? null;
  };

  const fetch_raceresults = async (): Promise<RaceResult[]> => {
    const raceresults: RaceResult[] = await locals.pb
      .collection("raceresults")
      .getFullList({ expand: "race,pxxs,dnfs" });

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

  return {
    racepicks: await fetch_racepicks(),
    currentrace: await fetch_currentrace(),
    raceresults: await fetch_raceresults(),
    drivers: await fetch_drivers(),
  };
};
