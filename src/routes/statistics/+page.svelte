<script lang="ts">
  import { Table, type TableColumn } from "$lib/components";
  import type { Driver, ScrapedRaceResultAcc } from "$lib/schema";
  import {
    LineChart,
    ScaleTypes,
    type ChartTabularData,
    type LineChartOptions,
  } from "@carbon/charts-svelte";
  import "@carbon/charts-svelte/styles.css";
  import type { PageData } from "./$types";
  import { get_by_value } from "$lib/database";
  import { make_chart_options } from "$lib/chart";

  let { data }: { data: PageData } = $props();

  // Await promises
  let drivers: Driver[] | undefined = $state(undefined);
  data.drivers.then((d: Driver[]) => (drivers = d));

  let scraped_raceresultsacc: ScrapedRaceResultAcc[] | undefined = $state(undefined);
  data.scraped_raceresultsacc.then((s: ScrapedRaceResultAcc[]) => (scraped_raceresultsacc = s));

  const drivers_columns: TableColumn[] = $derived([
    {
      data_value_name: "position",
      label: "Position",
      valuefun: async (value: string): Promise<string> =>
        `<span class='badge variant-filled-surface'>${value}</span>`,
    },
    {
      data_value_name: "driver_code",
      label: "Driver",
    },
    {
      data_value_name: "points",
      label: "Points",
      valuefun: async (value: string): Promise<string> =>
        `<span class='badge variant-filled-surface'>${value}</span>`,
    },
  ]);

  const teams_columns: TableColumn[] = $derived([
    {
      data_value_name: "position",
      label: "Position",
      valuefun: async (value: string): Promise<string> =>
        `<span class='badge variant-filled-surface'>${value}</span>`,
    },
    {
      data_value_name: "team_fullname",
      label: "team",
    },
    {
      data_value_name: "points",
      label: "Points",
      valuefun: async (value: string): Promise<string> =>
        `<span class='badge variant-filled-surface'>${value}</span>`,
    },
  ]);

  const drivers_chart_data: ChartTabularData = $derived.by(() => {
    if (!drivers || !scraped_raceresultsacc) return [];

    const active_drivers: Driver[] = drivers.filter((driver: Driver) => driver.active);
    const active_results: ScrapedRaceResultAcc[] = scraped_raceresultsacc.filter(
      (result: ScrapedRaceResultAcc) =>
        get_by_value(drivers ?? [], "code", result.driver_code)?.active,
    );

    return active_drivers
      .map((driver: Driver) => {
        return {
          group: driver.code,
          step: "0",
          points: 0,
        };
      })
      .concat(
        active_results.map((result: ScrapedRaceResultAcc) => {
          return {
            group: result.driver_code,
            step: result.race_step.toString(),
            points: result.acc_points,
          };
        }),
      );
  });

  const drivers_chart_options: LineChartOptions = make_chart_options("Drivers", "step", "points");
</script>

<svelte:head>
  <title>Formula 11 - Statistics</title>
</svelte:head>

<div class="card w-full bg-surface-100 p-2 shadow">
  <LineChart data={drivers_chart_data} options={drivers_chart_options} />
</div>

<div class="mt-2 grid w-full grid-cols-1 gap-2 lg:grid-cols-2">
  <div class="w-full">
    {#await data.scraped_driverstandings then driverstandings}
      <Table data={driverstandings} columns={drivers_columns} />
    {/await}
  </div>

  <div class="w-full">
    {#await data.scraped_teamstandings then teamstandings}
      <Table data={teamstandings} columns={teams_columns} />
    {/await}
  </div>
</div>
