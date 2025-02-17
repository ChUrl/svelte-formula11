import { pb } from "./pocketbase";
import type {
  CurrentPickedUser,
  Driver,
  Graphic,
  Race,
  RacePick,
  RaceResult,
  Substitution,
  Team,
  User,
} from "./schema";

/**
 * Fetch all [Graphics] from the database with file URLs
 */
export const fetch_graphics = async (fetch: (_: any) => Promise<Response>): Promise<Graphic[]> => {
  const graphics: Graphic[] = await pb.collection("graphics").getFullList({ fetch: fetch });

  graphics.map((graphic: Graphic) => {
    graphic.file_url = pb.files.getURL(graphic, graphic.file);
  });

  return graphics;
};

/**
 * Fetch all [Teams] (sorted ascending by name) from the database with file URLs for banners/logos
 */
export const fetch_teams = async (fetch: (_: any) => Promise<Response>): Promise<Team[]> => {
  const teams: Team[] = await pb.collection("teams").getFullList({
    sort: "+name",
    fetch: fetch,
  });

  teams.map((team: Team) => {
    team.banner_url = pb.files.getURL(team, team.banner);
    team.logo_url = pb.files.getURL(team, team.logo);
  });

  return teams;
};

/**
 * Fetch all [Drivers] (sorted ascending by code) from the database with file URLs for headshots
 */
export const fetch_drivers = async (fetch: (_: any) => Promise<Response>): Promise<Driver[]> => {
  const drivers: Driver[] = await pb.collection("drivers").getFullList({
    sort: "+code",
    fetch: fetch,
  });

  drivers.map((driver: Driver) => {
    driver.headshot_url = pb.files.getURL(driver, driver.headshot);
  });

  return drivers;
};

/**
 * Fetch all [Races] (sorted ascending by step) from the database with file URLs for pictograms
 */
export const fetch_races = async (fetch: (_: any) => Promise<Response>): Promise<Race[]> => {
  const races: Race[] = await pb.collection("races").getFullList({
    sort: "+step",
    fetch: fetch,
  });

  races.map((race: Race) => {
    race.pictogram_url = pb.files.getURL(race, race.pictogram);
  });

  return races;
};

/**
 * Fetch all [Substitutions] (sorted ascending by race step) from the database
 */
export const fetch_substitutions = async (
  fetch: (_: any) => Promise<Response>,
): Promise<Substitution[]> => {
  const substitutions: Substitution[] = await pb.collection("substitutions").getFullList({
    expand: "race",
    fetch: fetch,
  });

  // Sort by race step (ascending)
  substitutions.sort((a: Substitution, b: Substitution) => a.expand.race.step - b.expand.race.step);

  return substitutions;
};

/**
 * Fetch all [RaceResults] (sorted descending by race step - newest first) from the database
 */
export const fetch_raceresults = async (
  fetch: (_: any) => Promise<Response>,
): Promise<RaceResult[]> => {
  const raceresults: RaceResult[] = await pb
    .collection("raceresultsdesc")
    .getFullList({ fetch: fetch });

  return raceresults;
};

/**
 * Fetch all [Users] (sorted ascending by username) with file URLs for avatars
 */
export const fetch_users = async (fetch: (_: any) => Promise<Response>): Promise<User[]> => {
  const users: User[] = await pb
    .collection("users")
    .getFullList({ fetch: fetch, sort: "+username" });

  users.map((user: User) => {
    user.avatar_url = pb.files.getURL(user, user.avatar);
  });

  return users;
};

/**
 * Fetch the first [Race] without result from the database with file URL for the pictogram
 */
export const fetch_currentrace = async (
  fetch: (_: any) => Promise<Response>,
): Promise<Race | null> => {
  const currentrace: Race[] = await pb.collection("currentrace").getFullList({ fetch: fetch });

  // The currentrace collection either has a single or no entries
  if (currentrace.length == 0) return null;

  currentrace[0].pictogram_url = pb.files.getURL(currentrace[0], currentrace[0].pictogram);

  return currentrace[0];
};

/**
 * Fetch all [RacePicks] from the database
 */
export const fetch_racepicks = async (
  fetch: (_: any) => Promise<Response>,
): Promise<RacePick[]> => {
  // Don't expand race/pxx/dnf since we already fetched those
  const racepicks: RacePick[] = await pb
    .collection("racepicks")
    .getFullList({ fetch: fetch, expand: "user" });

  return racepicks;
};

/**
 * Fetch all [Users] (with the extra field "picked" that is truthy
 * if the user already picked for the current race)
 * for the current race with file URLs for the avatars
 */
export const fetch_currentpickedusers = async (
  fetch: (_: any) => Promise<Response>,
): Promise<CurrentPickedUser[]> => {
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
