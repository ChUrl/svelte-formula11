<script lang="ts">
  import { make_chart_options } from "$lib/chart";
  import { Table, type TableColumn } from "$lib/components";
  import { get_by_value } from "$lib/database";
  import type { RacePickPoints, RacePickPointsAcc, User } from "$lib/schema";
  import type { PageData } from "./$types";
  import {
    LineChart,
    ScaleTypes,
    type ChartTabularData,
    type LineChartOptions,
  } from "@carbon/charts-svelte";
  import "@carbon/charts-svelte/styles.css";

  let { data }: { data: PageData } = $props();

  // Await promises
  let users: User[] | undefined = $state(undefined);
  data.users.then((u: User[]) => (users = u));

  let racepickpoints: RacePickPoints[] | undefined = $state(undefined);
  data.racepickpoints.then((r: RacePickPoints[]) => (racepickpoints = r));

  let racepickpointsacc: RacePickPointsAcc[] | undefined = $state(undefined);
  data.racepickpointsacc.then((r: RacePickPointsAcc[]) => (racepickpointsacc = r));

  const leaderboard_columns: TableColumn[] = $derived([
    {
      data_value_name: "user",
      label: "User",
      valuefun: async (value: string): Promise<string> =>
        `<span class='badge variant-filled-surface'>${get_by_value(await data.users, "id", value)?.firstname ?? "Invalid"}</span>`,
    },
    {
      data_value_name: "total_points",
      label: "Total",
      valuefun: async (value: string): Promise<string> =>
        `<span class='badge variant-filled-surface'>${value}</span>`,
    },
    {
      data_value_name: "total_pxx_points",
      label: "PXX",
    },
    {
      data_value_name: "total_dnf_points",
      label: "DNF",
    },
    {
      data_value_name: "total_points_per_pick",
      label: "Per Pick",
      valuefun: async (value: string): Promise<string> => Number.parseFloat(value).toFixed(2),
    },
  ]);

  const points_chart_data: ChartTabularData = $derived.by(() => {
    if (!users || !racepickpointsacc) return [];

    return users
      .map((user: User) => {
        return {
          group: user.firstname,
          step: "0",
          points: 0,
        };
      })
      .concat(
        racepickpointsacc.map((points: RacePickPointsAcc) => {
          return {
            group: get_by_value(users ?? [], "id", points.user)?.firstname || "INVALID",
            step: points.step.toString(),
            points: points.acc_points,
          };
        }),
      );
  });

  const points_chart_options: LineChartOptions = make_chart_options(
    "I ❤️ CumSum",
    "step",
    "points",
  );
</script>

<svelte:head>
  <title>Formula 11 - Leaderboard</title>
</svelte:head>

<div class="card w-full bg-surface-100 p-2 shadow">
  <LineChart data={points_chart_data} options={points_chart_options} />
</div>

<div class="mt-2">
  {#await data.racepickpointstotal then racepickpointstotal}
    <Table data={racepickpointstotal} columns={leaderboard_columns} />
  {/await}
</div>
