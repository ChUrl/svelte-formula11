import type { ScrapedDriverStanding, ScrapedRaceResult, ScrapedTeamStanding } from "$lib/schema";
import * as cheerio from "cheerio";

// TODO: Validate the generated stuff

export const base_url: string = "https://www.formula1.com/en/results/2025";

/**
 * Returns a list of links to all past races of the season,
 * based on official f1.com data.
 */
export const scrape_race_links = async (): Promise<string[]> => {
  const races_response = await fetch(`${base_url}/races`);
  const races_text = await races_response.text();

  const $ = cheerio.load(races_text);

  const race_links: string[] = [];
  $("tbody > tr > td:first-child > p > a[href]", "div.f1-inner-wrapper table.f1-table").each(
    (_, element) => {
      race_links.push(element.attribs["href"]);
    },
  );
  console.log(`Found ${race_links.length} races...`);

  return race_links;
};

/**
 * Returns a list of [ScrapedRaceResults] for all races contained in [race_links],
 * based on official f1.com data.
 */
export const scrape_race_results = async (race_links: string[]): Promise<ScrapedRaceResult[]> => {
  const race_results: ScrapedRaceResult[] = [];
  await Promise.all(
    race_links.map(async (link: string, index: number) => {
      console.log(`Fetching race results from ${base_url}/${link}...`);
      const race_response = await fetch(`${base_url}/${link}`);
      const race_text = await race_response.text();

      const $ = cheerio.load(race_text);

      // Obtain the results for this race for each driver
      $("tbody > tr", "div.f1-inner-wrapper table.f1-table").each((driver_index, element) => {
        const $$ = cheerio.load(element);

        let result: ScrapedRaceResult = {
          id: "",
          race_step: index + 1,
          driver_code: $$("td:nth-child(3) > p > span:last-child").text(),
          position: driver_index + 1, // parseInt($$("td:nth-child(1) > p").text()),
          status: $$("td:nth-child(6) > p").text(),
          points: parseInt($$("td:nth-child(7) > p").text()),
        };

        // DSQ'd/DNF'd drivers have NaN positions
        // if (Number.isNaN(result.position)) {
        //   result.position = driver_index;
        // }

        race_results.push(result);
      });
    }),
  );
  console.log(`Scraped ${race_results.length} race results...`);

  return race_results;
};

/**
 * Returns a list of [ScrapedDriverStandings], based on official f1.com data.
 */
export const scrape_driver_standings = async (): Promise<ScrapedDriverStanding[]> => {
  const standings_response = await fetch(`${base_url}/drivers`);
  const standings_text = await standings_response.text();

  const $ = cheerio.load(standings_text);

  const driver_standings: ScrapedDriverStanding[] = [];
  $("tbody > tr", "div.f1-inner-wrapper table.f1-table").each((driver_index, element) => {
    const $$ = cheerio.load(element);

    let standing: ScrapedDriverStanding = {
      id: "",
      driver_code: $$("td:nth-child(2) > p > a > span:last-child").text(),
      position: driver_index + 1,
      points: parseInt($$("td:nth-child(5) > p").text()),
    };

    driver_standings.push(standing);
  });
  console.log(`Scraped ${driver_standings.length} driver standings...`);

  return driver_standings;
};

/**
 * Returns a list of [ScrapedTeamStandings], based on official f1.com data.
 */
export const scrape_team_standings = async (): Promise<ScrapedTeamStanding[]> => {
  const standings_response = await fetch(`${base_url}/team`);
  const standings_text = await standings_response.text();

  const $ = cheerio.load(standings_text);

  const team_standings: ScrapedTeamStanding[] = [];
  $("tbody > tr", "div.f1-inner-wrapper table.f1-table").each((team_index, element) => {
    const $$ = cheerio.load(element);

    let standing: ScrapedTeamStanding = {
      id: "",
      team_fullname: $$("td:nth-child(2) > p > a").text(),
      position: team_index + 1,
      points: parseInt($$("td:nth-child(3) > p").text()),
    };

    team_standings.push(standing);
  });
  console.log(`Scraped ${team_standings.length} team standings...`);

  return team_standings;
};
