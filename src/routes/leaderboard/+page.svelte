<script lang="ts">
  import { make_chart_options } from "$lib/chart";
  import { Table, type TableColumn } from "$lib/components";
  import { get_by_value } from "$lib/database";
  import type {
    RacePickPoints,
    RacePickPointsAcc,
    RacePickPointsTotal,
    SeasonPickPoints,
    User,
  } from "$lib/schema";
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

  let racepickpointstotal: RacePickPointsTotal[] | undefined = $state(undefined);
  let seasonpickpoints: SeasonPickPoints[] | undefined = $state(undefined);
  Promise.all([data.racepickpointstotal, data.seasonpickpoints]).then(
    ([rpp, spp]: [RacePickPointsTotal[], SeasonPickPoints[]]) => {
      if (spp.length === 0 || !spp) {
        racepickpointstotal = rpp;
        seasonpickpoints = undefined;
        return;
      }

      racepickpointstotal = rpp.sort((a: RacePickPointsTotal, b: RacePickPointsTotal) => {
        let apoints = spp.filter((p: SeasonPickPoints) => p.user === a.user)[0];
        let bpoints = spp.filter((p: SeasonPickPoints) => p.user === b.user)[0];
        return (
          b.total_points +
          calc_season_points(bpoints) -
          (a.total_points + calc_season_points(apoints))
        );
      });
      seasonpickpoints = spp;
    },
  );

  const calc_season_points = (p: SeasonPickPoints): number => {
    return (
      p.hottake_points +
      p.wdc_points +
      p.wcc_points +
      p.overtakes_points +
      p.dnfs_points +
      p.teamwinner_points +
      p.podium_points +
      p.doohan_points
    );
  };

  const leaderboard_columns: TableColumn[] = $derived([
    {
      data_value_name: "user",
      label: "User",
      valuefun: async (value: string): Promise<string> =>
        `<span class='badge variant-filled-surface'>${get_by_value(await data.users, "id", value)?.firstname ?? "Invalid"}</span>`,
    },
    {
      data_value_name: "user",
      label: "Total",
      valuefun: async (value: string): Promise<string> => {
        if (!racepickpointstotal) {
          return "ERR";
        }

        // let seasonpoints = await data.seasonpickpoints;
        let points = get_by_value(racepickpointstotal, "user", value)?.total_points ?? 0;
        if (!seasonpickpoints) {
          return `<span class='badge variant-filled-surface'>${points}</span>`;
        }

        points += calc_season_points(get_by_value(seasonpickpoints, "user", value)!);
        return `<span class='badge variant-filled-surface'>${points}</span>`;
      },
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
      data_value_name: "user",
      label: "Season",
      valuefun: async (value: string): Promise<string> => {
        if (!seasonpickpoints) {
          return "🍆";
        }

        let p = seasonpickpoints.filter((p: SeasonPickPoints) => p.user === value)[0];
        return calc_season_points(p).toString();
      },
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
  {#if racepickpointstotal}
    <Table data={racepickpointstotal} columns={leaderboard_columns} />
  {/if}
</div>
