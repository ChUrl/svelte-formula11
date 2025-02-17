import { pb } from "$lib/pocketbase";
import type { CurrentPickedUser, Race, RacePick } from "$lib/schema";
import type { PageLoad } from "../$types";

export const load: PageLoad = async ({ fetch }) => {
  const fetch_currentrace = async (): Promise<Race | null> => {
    const currentrace: Race[] = await pb.collection("currentrace").getFullList({ fetch: fetch });

    // The currentrace collection either has a single or no entries
    if (currentrace.length == 0) return null;

    currentrace[0].pictogram_url = pb.files.getURL(currentrace[0], currentrace[0].pictogram);

    return currentrace[0];
  };

  const fetch_racepicks = async (): Promise<RacePick[]> => {
    // Don't expand race/pxx/dnf since we already fetched those
    const racepicks: RacePick[] = await pb
      .collection("racepicks")
      .getFullList({ fetch: fetch, expand: "user" });

    return racepicks;
  };

  const fetch_currentpickedusers = async (): Promise<CurrentPickedUser[]> => {
    const currentpickedusers: CurrentPickedUser[] = await pb
      .collection("currentpickedusers")
      .getFullList({ fetch: fetch });

    currentpickedusers.map((currentpickeduser: CurrentPickedUser) => {
      if (currentpickeduser.avatar) {
        currentpickeduser.avatar_url = pb.files.getURL(currentpickeduser, currentpickeduser.avatar);
      }
    });

    return currentpickedusers;
  };
  return {
    racepicks: fetch_racepicks(),
    currentpickedusers: fetch_currentpickedusers(),

    currentrace: await fetch_currentrace(),
  };
};
