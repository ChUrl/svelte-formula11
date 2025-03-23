<script lang="ts">
  import { Table, type TableColumn } from "$lib/components";
  import { get_by_value } from "$lib/database";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const leaderboard_columns: TableColumn[] = $derived([
    {
      data_value_name: "user",
      label: "User",
      valuefun: async (value: string): Promise<string> =>
        get_by_value(await data.users, "id", value)?.firstname ?? "Invalid",
    },
    {
      data_value_name: "total_points",
      label: "Points",
    },
  ]);
</script>

<svelte:head>
  <title>Formula 11 - Leaderboard</title>
</svelte:head>

{#await Promise.all( [data.users, data.racepickpoints, data.racepickpointsacc], ) then [users, racepickpoints, racepickpointsacc]}
  <Table data={racepickpointsacc} columns={leaderboard_columns} />
{/await}
