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

/**
 * Generates a list of [DropdownOptions] for a <Dropdown> component.
 */
export const team_dropdown_options = (teams: Team[]): DropdownOption[] =>
  teams
    .sort((a: Team, b: Team) => a.name.localeCompare(b.name))
    .map((team: Team) => {
      return {
        label: team.name,
        value: team.id,
        icon_url: team.banner_url,
        icon_width: TEAM_BANNER_WIDTH,
        icon_height: TEAM_BANNER_HEIGHT,
      };
    });

/**
 * Generates a list of [DropdownOptions] for a <Dropdown> component.
 */
export const driver_dropdown_options = (drivers: Driver[]): DropdownOption[] =>
  drivers
    .sort((a: Driver, b: Driver) => a.lastname.localeCompare(b.lastname))
    .map((driver: Driver) => {
      return {
        label: `${driver.firstname} ${driver.lastname}`,
        value: driver.id,
        icon_url: driver.headshot_url,
        icon_width: DRIVER_HEADSHOT_WIDTH,
        icon_height: DRIVER_HEADSHOT_HEIGHT,
      };
    });

/**
 * Generates a list of [DropdownOptions] for a <Dropdown> component.
 */
export const race_dropdown_options = (races: Race[]): DropdownOption[] =>
  races
    .sort((a: Race, b: Race) => a.step - b.step)
    .map((race: Race) => {
      return {
        label: race.name,
        value: race.id,
        icon_url: race.pictogram_url,
        icon_width: RACE_PICTOGRAM_WIDTH,
        icon_height: RACE_PICTOGRAM_HEIGHT,
      };
    });
