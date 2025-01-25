import type { RacePick } from "$lib/schema";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, locals }) => {
  const fetch_racepicks = async (): Promise<RacePick[]> => {
    // TODO: What is faster, expanding everything or filling in using individual requests?
    //       Probably expanding everything directly...
    const racepicks: RacePick[] = await locals.pb
      .collection("racepicks")
      .getFullList({ fetch: fetch, expand: "user,race,pxx,dnf" });

    return racepicks;
  };

  return {
    racepicks: await fetch_racepicks(),
  };
};
