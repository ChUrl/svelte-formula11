import type { DropdownOption } from "$lib/components";
import type { Driver, Race, Team } from "$lib/schema";
import {
  DRIVER_HEADSHOT_HEIGHT,
  DRIVER_HEADSHOT_WIDTH,
  RACE_PICTOGRAM_HEIGHT,
  RACE_PICTOGRAM_WIDTH,
  TEAM_BANNER_HEIGHT,
  TEAM_BANNER_WIDTH,
} from "$lib/config";

let team_dropdown_opts: DropdownOption[] | null = null;

/**
 * Generates a list of [DropdownOptions] for a <Dropdown> component.
 * Cached until page reload.
 */
export const team_dropdown_options = (teams: Team[]): DropdownOption[] => {
  if (!team_dropdown_opts) {
    console.log("team_dropdown_options");
    team_dropdown_opts = teams.map((team: Team) => {
      return {
        label: team.name,
        value: team.id,
        icon_url: team.banner_url,
        icon_width: TEAM_BANNER_WIDTH,
        icon_height: TEAM_BANNER_HEIGHT,
      };
    });
  }

  return team_dropdown_opts;
};

/**
 * Generates a list of [DropdownOptions] for a <Dropdown> component.
 * Not cached, because drivers are often filtered by active/inactive.
 */
export const driver_dropdown_options = (drivers: Driver[]): DropdownOption[] => {
  return drivers.map((driver: Driver) => {
    return {
      label: driver.code,
      value: driver.id,
      icon_url: driver.headshot_url,
      icon_width: DRIVER_HEADSHOT_WIDTH,
      icon_height: DRIVER_HEADSHOT_HEIGHT,
    };
  });
};

let race_dropdown_opts: DropdownOption[] | null = null;

/**
 * Generates a list of [DropdownOptions] for a <Dropdown> component.
 * Cached until page reload.
 */
export const race_dropdown_options = (races: Race[]): DropdownOption[] => {
  if (!race_dropdown_opts) {
    console.log("race_dropdown_options");
    race_dropdown_opts = races.map((race: Race) => {
      return {
        label: race.name,
        value: race.id,
        icon_url: race.pictogram_url,
        icon_width: RACE_PICTOGRAM_WIDTH,
        icon_height: RACE_PICTOGRAM_HEIGHT,
      };
    });
  }

  return race_dropdown_opts;
};
