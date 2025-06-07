<script lang="ts">
  import { Table, type TableColumn } from "$lib/components";
  import type { PageData } from "./$types";
  import { get_by_value } from "$lib/database";
  import type { Race } from "$lib/schema";

  let { data }: { data: PageData } = $props();

  const grids_columns: TableColumn[] = $derived([
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
      data_value_name: "time",
      label: "Time",
    },
  ]);
</script>

<svelte:head>
  <title>Formula 11 - Official Starting Grids</title>
</svelte:head>

{#await data.scraped_startinggrids then grids}
  <Table
    data={grids}
    columns={grids_columns}
    height="h-[calc(100vh-260px)] lg:h-[calc(100vh-180px)]"
  />
{/await}
