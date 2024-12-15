import type { Actions, PageServerLoad } from "./$types";
import {
  form_data_clean,
  form_data_ensure_keys,
  form_data_fix_dates,
  form_data_get_and_remove_id,
} from "$lib/form";
import type { Team, Driver, Race, Substitution, Graphic } from "$lib/schema";

// These "actions" run serverside only, as they're located inside +page.server.ts
export const actions = {
  create_team: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    const data: FormData = form_data_clean(await request.formData());
    form_data_ensure_keys(data, ["name", "logo"]);

    await locals.pb.collection("teams").create(data);

    return { tab: 0 };
  },

  update_team: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    const data: FormData = form_data_clean(await request.formData());
    const id: string = form_data_get_and_remove_id(data);

    await locals.pb.collection("teams").update(id, data);

    return { tab: 0 };
  },

  delete_team: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    const data: FormData = form_data_clean(await request.formData());
    const id: string = form_data_get_and_remove_id(data);

    await locals.pb.collection("teams").delete(id);

    return { tab: 0 };
  },

  create_driver: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    const data: FormData = form_data_clean(await request.formData());
    form_data_ensure_keys(data, ["firstname", "lastname", "code", "team", "headshot", "active"]);

    await locals.pb.collection("drivers").create(data);

    return { tab: 1 };
  },

  update_driver: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    const data: FormData = form_data_clean(await request.formData());
    const id: string = form_data_get_and_remove_id(data);

    await locals.pb.collection("drivers").update(id, data);

    return { tab: 1 };
  },

  delete_driver: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    const data: FormData = form_data_clean(await request.formData());
    const id: string = form_data_get_and_remove_id(data);

    await locals.pb.collection("drivers").delete(id);

    return { tab: 1 };
  },

  create_race: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    const data: FormData = form_data_clean(await request.formData());
    form_data_ensure_keys(data, ["name", "step", "pictogram", "pxx", "qualidate", "racedate"]);
    form_data_fix_dates(data, ["sprintqualidate", "sprintdate", "qualidate", "racedate"]);

    await locals.pb.collection("races").create(data);

    return { tab: 2 };
  },

  update_race: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    // Do not remove empty sprint dates so they can be cleared by updating the record
    const data: FormData = form_data_clean(await request.formData(), [
      "sprintqualidate",
      "sprintdate",
    ]);
    form_data_fix_dates(data, ["sprintqualidate", "sprintdate", "qualidate", "racedate"]);
    const id: string = form_data_get_and_remove_id(data);

    await locals.pb.collection("races").update(id, data);

    return { tab: 2 };
  },

  delete_race: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    const data: FormData = form_data_clean(await request.formData());
    const id: string = form_data_get_and_remove_id(data);

    await locals.pb.collection("races").delete(id);

    return { tab: 2 };
  },

  create_substitution: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    const data: FormData = form_data_clean(await request.formData());
    form_data_ensure_keys(data, ["substitute", "for", "race"]);

    await locals.pb.collection("substitutions").create(data);

    return { tab: 3 };
  },

  update_substitution: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    const data: FormData = form_data_clean(await request.formData());
    const id: string = form_data_get_and_remove_id(data);

    await locals.pb.collection("substitutions").update(id, data);

    return { tab: 3 };
  },

  delete_substitution: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    const data: FormData = form_data_clean(await request.formData());
    const id: string = form_data_get_and_remove_id(data);

    await locals.pb.collection("substitutions").delete(id);

    return { tab: 3 };
  },
} satisfies Actions;

// This "load" function runs serverside only, as it's located inside +page.server.ts
export const load: PageServerLoad = async ({ fetch, locals }) => {
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
      team.logo_url = locals.pb.files.getURL(team, team.logo);
    });

    return teams;
  };

  const fetch_drivers = async (): Promise<Driver[]> => {
    const drivers: Driver[] = await locals.pb.collection("drivers").getFullList({
      sort: "+lastname",
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
    graphics: await fetch_graphics(),
    teams: await fetch_teams(),
    drivers: await fetch_drivers(),
    races: await fetch_races(),
    substitutions: await fetch_substitutions(),
  };
};
