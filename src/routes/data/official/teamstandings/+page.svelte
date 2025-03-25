<script lang="ts">
  import { Table, type TableColumn } from "$lib/components";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const standings_columns: TableColumn[] = $derived([
    {
      data_value_name: "team_fullname",
      label: "Team",
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
  <title>Formula 11 - Official Team Standings</title>
</svelte:head>

{#await data.scraped_teamstandings then standings}
  <Table
    data={standings}
    columns={standings_columns}
    height="h-[calc(100vh-260px)] lg:h-[calc(100vh-180px)]"
  />
{/await}
