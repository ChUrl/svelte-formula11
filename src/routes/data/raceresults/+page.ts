import { pb } from "$lib/pocketbase";
import type { RaceResult } from "$lib/schema";
import type { PageLoad } from "../../$types";

export const load: PageLoad = async ({ fetch }) => {
  // TODO: Duplicated code from racepicks/+page.server.ts
  const fetch_raceresults = async (): Promise<RaceResult[]> => {
    const raceresults: RaceResult[] = await pb
      .collection("raceresultsdesc")
      .getFullList({ fetch: fetch });

    return raceresults;
  };

  return {
    results: await fetch_raceresults(),
  };
};
