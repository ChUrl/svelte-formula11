<script lang="ts">
  import { Table, type TableColumn } from "$lib/components";
  import type { PageData } from "./$types";
  import { get_by_value } from "$lib/database";
  import type { Race } from "$lib/schema";

  let { data }: { data: PageData } = $props();

  const results_columns: TableColumn[] = $derived([
    {
      data_value_name: "race_step",
      label: "Race",
      valuefun: async (value: string): Promise<string> => {
        const racename: string = get_by_value(await data.races, "step", value)?.name ?? "Invalid";
        return `<span class='badge variant-filled-surface'>${racename}</span>`;
      },
    },
    {
      data_value_name: "race_step",
      label: "Step",
    },
    {
      data_value_name: "driver_code",
      label: "Driver",
      valuefun: async (value: string): Promise<string> =>
        `<span class='badge variant-filled-surface'>${value}</span>`,
    },
    {
      data_value_name: "position",
      label: "Position",
    },
    {
      data_value_name: "status",
      label: "Status",
    },
    {
      data_value_name: "points",
      label: "Points",
      valuefun: async (value: string): Promise<string> =>
        `<span class='badge variant-filled-surface'>${value}</span>`,
    },
  ]);
</script>

<svelte:head>
  <title>Formula 11 - Official Race Results</title>
</svelte:head>

{#await data.scraped_raceresults then results}
  <Table
    data={results}
    columns={results_columns}
    height="h-[calc(100vh-260px)] lg:h-[calc(100vh-180px)]"
  />
{/await}
