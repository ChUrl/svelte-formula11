import {
  fetch_scraped_driverstandings,
  fetch_scraped_raceresults,
  fetch_scraped_startinggrids,
  fetch_scraped_teamstandings,
} from "$lib/fetch";
import { pb } from "$lib/pocketbase";
import type {
  ScrapedDriverStanding,
  ScrapedRaceResult,
  ScrapedStartingGrid,
  ScrapedTeamStanding,
} from "$lib/schema";
import {
  scrape_driver_standings,
  scrape_race_links,
  scrape_race_results,
  scrape_starting_grids,
  scrape_team_standings,
} from "$lib/server/scrape";
import type { RequestHandler } from "./$types";

/**
 * This route is available at /api/scrape.
 * It will fetch current statistics from f1.com and insert them into the database.
 */
// TODO: If this function aborts, it will leave the official data in an inconsistent state...
//       Would be nice to use transactions for this, do I need to implement this as PB extension?
export const POST: RequestHandler = async ({ request }) => {
  console.log("Fetching race results from f1.com...");

  // Obtain the results for each race
  const racelinks: string[] = await scrape_race_links();
  const startinggrids: ScrapedStartingGrid[] = await scrape_starting_grids(racelinks);
  const raceresults: ScrapedRaceResult[] = await scrape_race_results(racelinks);
  const driverstandings: ScrapedDriverStanding[] = await scrape_driver_standings();
  const teamstandings: ScrapedTeamStanding[] = await scrape_team_standings();

  // Clear existing PocketBase data
  // TODO: Do I really have to fetch everything just to delete it???
  let deleted: number = 0;
  const scraped_startinggrids: ScrapedStartingGrid[] = await fetch_scraped_startinggrids(fetch);
  for (const grid of scraped_startinggrids) {
    try {
      await pb.collection("scraped_startinggrids").delete(grid.id);
    } catch (e) {
      console.log(e);
      return new Response(); // TODO: Return error
    }
    deleted++;
  }
  console.log(`Deleted ${deleted}/${scraped_startinggrids.length} starting grids`);

  deleted = 0;
  const scraped_raceresults: ScrapedRaceResult[] = await fetch_scraped_raceresults(fetch);
  for (const result of scraped_raceresults) {
    try {
      await pb.collection("scraped_raceresults").delete(result.id);
    } catch (e) {
      console.log(e);
      return new Response(); // TODO: Return error
    }
    deleted++;
  }
  console.log(`Deleted ${deleted}/${scraped_raceresults.length} race results.`);

  deleted = 0;
  const scraped_driverstandings: ScrapedDriverStanding[] =
    await fetch_scraped_driverstandings(fetch);
  for (const standing of scraped_driverstandings) {
    try {
      await pb.collection("scraped_driverstandings").delete(standing.id);
    } catch (e) {
      console.log(e);
      return new Response(); // TODO: Return error
    }
    deleted++;
  }
  console.log(`Deleted ${deleted}/${scraped_driverstandings.length} driver standings.`);

  deleted = 0;
  const scraped_teamstandings: ScrapedTeamStanding[] = await fetch_scraped_teamstandings(fetch);
  for (const standing of scraped_teamstandings) {
    try {
      await pb.collection("scraped_teamstandings").delete(standing.id);
    } catch (e) {
      console.log(e);
      return new Response(); // TODO: Return error
    }
    deleted++;
  }
  console.log(`Deleted ${deleted}/${scraped_teamstandings.length} team standings.`);

  // Submit new data to PocketBase
  let submissions: number = 0;
  for (const grid of startinggrids) {
    try {
      // TODO: Authenticate this
      await pb.collection("scraped_startinggrids").create(grid);
    } catch (e) {
      console.log("Error occured while submitting scraped data to PocketBase:");
      console.log(e);
      console.log("Error occured for this starting grid:");
      console.log(grid);
      console.log("Aborting submissions...");
      return new Response(); // TODO: Return error
    }
    submissions++;
  }
  console.log(`Submitted ${submissions}/${startinggrids.length} starting grids.`);

  submissions = 0;
  for (const result of raceresults) {
    try {
      // TODO: Authenticate this
      await pb.collection("scraped_raceresults").create(result);
    } catch (e) {
      console.log("Error occured while submitting scraped data to PocketBase:");
      console.log(e);
      console.log("Error occured for this race result:");
      console.log(result);
      console.log("Aborting submissions...");
      return new Response(); // TODO: Return error
    }
    submissions++;
  }
  console.log(`Submitted ${submissions}/${raceresults.length} race results.`);

  submissions = 0;
  for (const standing of driverstandings) {
    try {
      // TODO: Authenticate this
      await pb.collection("scraped_driverstandings").create(standing);
    } catch (e) {
      console.log("Error occured while submitting scraped data to PocketBase:");
      console.log(e);
      console.log("Error occured for this driver standing:");
      console.log(standing);
      console.log("Aborting submissions...");
      return new Response(); // TODO: Return error
    }
    submissions++;
  }
  console.log(`Submitted ${submissions}/${driverstandings.length} driver standings.`);

  submissions = 0;
  for (const standing of teamstandings) {
    try {
      // TODO: Authenticate this
      await pb.collection("scraped_teamstandings").create(standing);
    } catch (e) {
      console.log("Error occured while submitting scraped data to PocketBase:");
      console.log(e);
      console.log("Error occured for this team standing:");
      console.log(standing);
      console.log("Aborting submissions...");
      return new Response(); // TODO: Return error
    }
    submissions++;
  }
  console.log(`Submitted ${submissions}/${teamstandings.length} team standings.`);

  return new Response(); // TODO: Return success
};
