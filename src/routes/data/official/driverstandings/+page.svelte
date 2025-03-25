<script lang="ts">
  import { Table, type TableColumn } from "$lib/components";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const standings_columns: TableColumn[] = $derived([
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
      data_value_name: "points",
      label: "Points",
      valuefun: async (value: string): Promise<string> =>
        `<span class='badge variant-filled-surface'>${value}</span>`,
    },
  ]);
</script>

<svelte:head>
  <title>Formula 11 - Official Driver Standings</title>
</svelte:head>

{#await data.scraped_driverstandings then standings}
  <Table
    data={standings}
    columns={standings_columns}
    height="h-[calc(100vh-260px)] lg:h-[calc(100vh-180px)]"
  />
{/await}
