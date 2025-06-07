<script lang="ts">
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
        get_by_value(await data.users, "id", value)?.firstname ?? "Invalid",
    },
    {
      data_value_name: "total_points",
      label: "Total",
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

  const points_chart_options: LineChartOptions = {
    title: "I ❤️ CumSum",
    axes: {
      bottom: {
        mapsTo: "step",
        scaleType: ScaleTypes.LABELS,
      },
      left: {
        mapsTo: "points",
        scaleType: ScaleTypes.LINEAR,
      },
    },
    curve: "curveMonotoneX",
    // toolbar: {
    //   enabled: false,
    // },
    animations: true,
    // canvasZoom: {
    //   enabled: false,
    // },
    grid: {
      x: {
        enabled: true,
        alignWithAxisTicks: true,
      },
      y: {
        enabled: true,
        alignWithAxisTicks: true,
      },
    },
    legend: {
      enabled: true,
      clickable: true,
      position: "top",
    },
    points: {
      enabled: true,
      radius: 5,
    },
    tooltip: {
      showTotal: false,
    },
    resizable: true,
    width: "100%",
    height: "400px",
  };
</script>

<svelte:head>
  <title>Formula 11 - Leaderboard</title>
</svelte:head>

{#await Promise.all( [data.users, data.racepickpoints, data.racepickpointsacc, data.racepickpointstotal], ) then [users, racepickpoints, racepickpointsacc, racepickpointstotal]}
  <div class="flex gap-2">
    <!-- Podium -->
    <!-- <div class="card w-60 bg-surface-100 p-2 shadow"> -->
    <!--   <div class="flex h-20 w-full gap-1"></div> -->
    <!--   <div class="flex h-20 w-full gap-1"> -->
    <!--     <div class="w-20"> -->
    <!--       <div class="h-[30%] w-full"></div> -->
    <!--       <div class="h-[70%] w-full bg-surface-500"></div> -->
    <!--     </div> -->
    <!--     <div class="w-20"> -->
    <!--       <div class="h-[100%] w-full bg-surface-500"></div> -->
    <!--     </div> -->
    <!--     <div class="w-20"> -->
    <!--       <div class="h-[60%] w-full"></div> -->
    <!--       <div class="h-[40%] w-full bg-surface-600"></div> -->
    <!--     </div> -->
    <!--   </div> -->
    <!-- </div> -->

    <!-- Points chart -->
    <div class="card w-full bg-surface-100 p-2 shadow">
      <LineChart data={points_chart_data} options={points_chart_options} />
    </div>
  </div>

  <div class="mt-2">
    <Table data={racepickpointstotal} columns={leaderboard_columns} />
  </div>
{/await}
