import {
  form_data_clean,
  form_data_ensure_keys,
  form_data_get_and_remove_id,
  form_data_remove,
} from "$lib/form";
import type { Driver, Graphic, Race, RaceResult } from "$lib/schema";
import type { Actions, PageServerLoad } from "./$types";

export const actions = {
  create_raceresult: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    const data: FormData = form_data_clean(await request.formData());
    form_data_ensure_keys(data, ["race", "pxxs"]);
    form_data_remove(data, ["pxxs_codes", "dnfs_codes"]);

    await locals.pb.collection("raceresults").create(data);
  },

  update_raceresult: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    const data: FormData = form_data_clean(await request.formData());
    form_data_remove(data, ["pxxs_codes", "dnfs_codes"]);
    const id: string = form_data_get_and_remove_id(data);

    console.dir(data, { depth: null });

    await locals.pb.collection("raceresults").update(id, data);
  },

  delete_raceresult: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    const data: FormData = form_data_clean(await request.formData());
    form_data_remove(data, ["pxxs_codes", "dnfs_codes"]);
    const id: string = form_data_get_and_remove_id(data);

    await locals.pb.collection("raceresults").delete(id);
  },
} as Actions;

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

  // TODO: Duplicated code from racepicks/+page.server.ts + users/+page.server.ts
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
    results: await fetch_raceresults(),
    races: await fetch_races(),
    drivers: await fetch_drivers(),
    graphics: await fetch_graphics(),
  };
};
