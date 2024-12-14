import type { Actions, PageServerLoad } from "./$types";
import { form_data_clean, form_data_ensure_keys, form_data_get_and_remove_id } from "$lib/form";
import type { Team, Driver, Race, Substitution, Graphic } from "$lib/schema";

// These "actions" run serverside only, as they're located inside +page.server.ts
export const actions = {
  create_team: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    const data: FormData = form_data_clean(await request.formData());
    form_data_ensure_keys(data, ["name", "logo"]);

    const record: Team = await locals.pb.collection("teams").create(data);

    return { tab: 0 };
  },

  update_team: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    const data: FormData = form_data_clean(await request.formData());
    const id: string = form_data_get_and_remove_id(data);

    const record: Team = await locals.pb.collection("teams").update(id, data);

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

    console.log(data);

    const record: Driver = await locals.pb.collection("drivers").create(data);

    return { tab: 1 };
  },

  update_driver: async ({ request, locals }) => {
    if (!locals.admin) return { unauthorized: true };

    const data: FormData = form_data_clean(await request.formData());
    const id: string = form_data_get_and_remove_id(data);

    const record: Driver = await locals.pb.collection("drivers").update(id, data);

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
    return { tab: 2 };
  },
  update_race: async ({ request, locals }) => {
    return { tab: 2 };
  },
  delete_race: async ({ request, locals }) => {
    return { tab: 2 };
  },

  create_substitution: async ({ request, locals }) => {
    return { tab: 2 };
  },
  update_substitution: async ({ request, locals }) => {
    return { tab: 2 };
  },
  delete_substitution: async ({ request, locals }) => {
    return { tab: 2 };
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
    return [];
  };

  const fetch_substitutions = async (): Promise<Substitution[]> => {
    return [];
  };

  return {
    graphics: await fetch_graphics(),
    teams: await fetch_teams(),
    drivers: await fetch_drivers(),
    races: await fetch_races(),
    substitutions: await fetch_substitutions(),
  };
};
