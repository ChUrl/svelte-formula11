import type { Graphic } from "$lib/schema";

/**
 * Select an element from an [objects] array where [key] matches [value].
 * Supposed to be used on collections returned by the [PocketBase] client.
 */
export const get_by_value = <T extends object>(
  objects: T[],
  key: keyof T,
  value: string,
): T | undefined => {
  return objects.find((o: T) => (key in o ? o[key] === value : false));
};

export const get_team_banner_template = (graphics: Graphic[]) =>
  get_by_value(graphics, "name", "team_banner_template")?.file_url ?? "Invalid";

export const get_team_logo_template = (graphics: Graphic[]) =>
  get_by_value(graphics, "name", "team_logo_template")?.file_url ?? "Invalid";

export const get_driver_headshot_template = (graphics: Graphic[]) =>
  get_by_value(graphics, "name", "driver_headshot_template")?.file_url ?? "Invalid";

export const get_race_pictogram_template = (graphics: Graphic[]) =>
  get_by_value(graphics, "name", "race_pictogram_template")?.file_url ?? "Invalid";
