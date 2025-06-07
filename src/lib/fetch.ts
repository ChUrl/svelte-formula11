import { get } from "svelte/store";
import { pb, pbUser } from "./pocketbase";
import type {
  CurrentPickedUser,
  Driver,
  Graphic,
  Hottake,
  Race,
  RacePick,
  RacePickPoints,
  RacePickPointsAcc,
  RacePickPointsTotal,
  RaceResult,
  ScrapedDriverStanding,
  ScrapedRaceResult,
  ScrapedRaceResultAcc,
  ScrapedStartingGrid,
  ScrapedTeamStanding,
  SeasonPick,
  SeasonPickedUser,
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
    if (user.avatar) {
      user.avatar_url = pb.files.getURL(user, user.avatar);
    }
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
 * Fetch all visible [RacePicks] from the database
 */
export const fetch_visibleracepicks = async (
  fetch: (_: any) => Promise<Response>,
): Promise<RacePick[]> => {
  const racepicks: RacePick[] = await pb
    .collection("visibleracepicks")
    .getFullList({ fetch: fetch, expand: "user" });

  return racepicks;
};

/**
 * Fetch the [RacePick] for the current race by the current user from the database
 */
export const fetch_currentracepick = async (
  fetch: (_: any) => Promise<Response>,
): Promise<RacePick | undefined> => {
  const user: User | undefined = get(pbUser);
  if (!user) return undefined;

  const currentpickeduser: CurrentPickedUser = await pb
    .collection("currentpickedusers")
    .getOne(user.id, { fetch: fetch });

  if (!currentpickeduser.picked) return undefined;

  const racepick: RacePick = await pb
    .collection("racepicks")
    .getOne(currentpickeduser.picked, { fetch: fetch });

  return racepick;
};

/**
 * Fetch all visible [SeasonPicks] from the database
 */
export const fetch_visibleseasonpicks = async (
  fetch: (_: any) => Promise<Response>,
): Promise<SeasonPick[]> => {
  const seasonpicks: SeasonPick[] = await pb
    .collection("visibleseasonpicks")
    .getFullList({ fetch: fetch, expand: "user" });

  return seasonpicks;
};

/**
 * Fetch all [Hottakes] from the databse
 */
export const fetch_hottakes = async (fetch: (_: any) => Promise<Response>): Promise<Hottake[]> => {
  const hottakes: Hottake[] = await pb
    .collection("hottakes")
    .getFullList({ fetch: fetch, expand: "user" });

  return hottakes;
};

/**
 * Fetch the [SeasonPick] by the current user from the database
 */
export const fetch_currentseasonpick = async (
  fetch: (_: any) => Promise<Response>,
): Promise<SeasonPick | undefined> => {
  const user: User | undefined = get(pbUser);
  if (!user) return undefined;

  const seasonpickeduser: CurrentPickedUser = await pb
    .collection("seasonpickedusers")
    .getOne(user.id, { fetch: fetch });

  if (!seasonpickeduser.picked) return undefined;

  const seasonpick: SeasonPick = await pb
    .collection("seasonpicks")
    .getOne(seasonpickeduser.picked, { fetch: fetch });

  return seasonpick;
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

/**
 * Fetch all [Users] (with the extra field "picked" that is truthy
 * if the user already picked for the season) with file URLs for the avatars
 */
export const fetch_seasonpickedusers = async (
  fetch: (_: any) => Promise<Response>,
): Promise<SeasonPickedUser[]> => {
  const seasonpickedusers: SeasonPickedUser[] = await pb
    .collection("seasonpickedusers")
    .getFullList({ fetch: fetch });

  seasonpickedusers.map((seasonpickeduser: SeasonPickedUser) => {
    if (seasonpickeduser.avatar) {
      seasonpickeduser.avatar_url = pb.files.getURL(seasonpickeduser, seasonpickeduser.avatar);
    }
  });

  return seasonpickedusers;
};

/**
 * Fetch all [RacePickPoints] from the database
 */
export const fetch_racepickpoints = async (
  fetch: (_: any) => Promise<Response>,
): Promise<RacePickPoints[]> => {
  const racepickpoints: RacePickPoints[] = await pb
    .collection("racepickpoints")
    .getFullList({ fetch: fetch });

  return racepickpoints;
};

/**
 * Fetch all [RacePickPointsAcc] from the database, ordered ascendingly by step.
 */
export const fetch_racepickpointsacc = async (
  fetch: (_: any) => Promise<Response>,
): Promise<RacePickPointsAcc[]> => {
  const racepickpointsacc: RacePickPointsAcc[] = await pb
    .collection("racepickpointsacc")
    .getFullList({ fetch: fetch });

  return racepickpointsacc;
};

/**
 * Fetch all [RacePickPointsTotal] from the database, ordered descendingly by total points.
 */
export const fetch_racepickpointstotal = async (
  fetch: (_: any) => Promise<Response>,
): Promise<RacePickPointsTotal[]> => {
  const racepickpointstotal: RacePickPointsTotal[] = await pb
    .collection("racepickpointstotal")
    .getFullList({ fetch: fetch });

  return racepickpointstotal;
};

/**
 * Fetch all [ScrapedDriverStandings] from the database, ordered ascendingly by position.
 */
export const fetch_scraped_driverstandings = async (
  fetch: (_: any) => Promise<Response>,
): Promise<ScrapedDriverStanding[]> => {
  const scraped_driverstandings: ScrapedDriverStanding[] = await pb
    .collection("scraped_driverstandings")
    .getFullList({ fetch: fetch, sort: "+position" });

  return scraped_driverstandings;
};

/**
 * Fetch all [ScrapedTeamStandings] from the database, ordered ascendingly by position.
 */
export const fetch_scraped_teamstandings = async (
  fetch: (_: any) => Promise<Response>,
): Promise<ScrapedTeamStanding[]> => {
  const scraped_teamstandings: ScrapedTeamStanding[] = await pb
    .collection("scraped_teamstandings")
    .getFullList({ fetch: fetch, sort: "+position" });

  return scraped_teamstandings;
};

/**
 * Fetch all [ScrapedStartingGrids] from the database, ordered descendingly by race step.
 */
export const fetch_scraped_startinggrids = async (
  fetch: (_: any) => Promise<Response>,
): Promise<ScrapedStartingGrid[]> => {
  const scraped_startinggrids: ScrapedStartingGrid[] = await pb
    .collection("scraped_startinggrids")
    .getFullList({ fetch: fetch, sort: "-race_step,+position" });

  return scraped_startinggrids;
};

/**
 * Fetch all [ScrapedRaceResults] from the database, ordered descendingly by race step.
 */
export const fetch_scraped_raceresults = async (
  fetch: (_: any) => Promise<Response>,
): Promise<ScrapedRaceResult[]> => {
  const scraped_raceresults: ScrapedRaceResult[] = await pb
    .collection("scraped_raceresults")
    .getFullList({ fetch: fetch, sort: "-race_step,+position" });

  return scraped_raceresults;
};

/**
 * Fetch all [ScrapedRaceResultsAcc] from the database, ordered ascendingly by race step.
 */
export const fetch_scraped_raceresultsacc = async (
  fetch: (_: any) => Promise<Response>,
): Promise<ScrapedRaceResultAcc[]> => {
  const scraped_raceresultsacc: ScrapedRaceResultAcc[] = await pb
    .collection("scraped_raceresultsacc")
    .getFullList({ fetch: fetch, sort: "+race_step" });

  return scraped_raceresultsacc;
};
