import { form_data_clean, form_data_ensure_keys, form_data_get_and_remove_id } from "$lib/form";
import type { CurrentPickedUser, Driver, Graphic, Race, RacePick, RaceResult } from "$lib/schema";
import type { Actions, PageServerLoad } from "./$types";

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

  const fetch_currentpickedusers = async (): Promise<CurrentPickedUser[]> => {
    const currentpickedusers: CurrentPickedUser[] = await locals.pb
      .collection("currentpickedusers")
      .getFullList();

    currentpickedusers.map((currentpickeduser: CurrentPickedUser) => {
      if (currentpickeduser.avatar) {
        currentpickeduser.avatar_url = locals.pb.files.getURL(
          currentpickeduser,
          currentpickeduser.avatar,
        );
      }
    });

    return currentpickedusers;
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

  // TODO: Duplicated code from data/season/+layout.server.ts
  const fetch_graphics = async (): Promise<Graphic[]> => {
    const graphics: Graphic[] = await locals.pb
      .collection("graphics")
      .getFullList({ fetch: fetch });

    graphics.map((graphic: Graphic) => {
      graphic.file_url = locals.pb.files.getURL(graphic, graphic.file);
    });

    return graphics;
  };

  return {
    racepicks: await fetch_racepicks(),
    currentrace: await fetch_currentrace(),
    currentpickedusers: await fetch_currentpickedusers(),
    raceresults: await fetch_raceresults(),
    drivers: await fetch_drivers(),
    races: await fetch_races(),
    graphics: await fetch_graphics(),
  };
};

export const actions = {
  create_racepick: async ({ request, locals }) => {
    const data: FormData = form_data_clean(await request.formData());
    form_data_ensure_keys(data, ["user", "race", "pxx", "dnf"]);

    if (locals.user?.id !== data.get("user")) return { unauthorized: true };

    await locals.pb.collection("racepicks").create(data);
  },

  update_racepick: async ({ request, locals }) => {
    const data: FormData = form_data_clean(await request.formData());
    form_data_ensure_keys(data, ["user", "race"]);
    const id: string = form_data_get_and_remove_id(data);

    if (locals.user?.id !== data.get("user")) return { unauthorized: true };

    await locals.pb.collection("racepicks").update(id, data);
  },

  delete_racepick: async ({ request, locals }) => {
    const data: FormData = form_data_clean(await request.formData());
    form_data_ensure_keys(data, ["user", "race"]);
    const id: string = form_data_get_and_remove_id(data);

    if (locals.user?.id !== data.get("user")) return { unauthorized: true };

    await locals.pb.collection("racepicks").delete(id);
  },
} satisfies Actions;
