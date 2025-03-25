<script lang="ts">
  import { Button, Table, type TableColumn } from "$lib/components";
  import type { Team } from "$lib/schema";
  import { getModalStore, type ModalSettings, type ModalStore } from "@skeletonlabs/skeleton";
  import type { PageData } from "./$types";
  import { get_by_value } from "$lib/database";

  let { data }: { data: PageData } = $props();

  const modalStore: ModalStore = getModalStore();
  const team_handler = async (event: Event, id?: string) => {
    const team: Team | undefined = get_by_value(await data.teams, "id", id ?? "Invalid");

    // If we expect to find a team but don't, abort
    if (id && !team) return;

    const modalSettings: ModalSettings = {
      type: "component",
      component: "teamCard",
      meta: {
        data,
        team,
      },
    };

    modalStore.trigger(modalSettings);
  };

  const teams_columns: TableColumn[] = $derived([
    {
      data_value_name: "name",
      label: "Name",
      valuefun: async (value: string): Promise<string> =>
        `<span class='badge variant-filled-surface'>${value}</span>`,
    },
    {
      data_value_name: "color",
      label: "Color",
      valuefun: async (value: string): Promise<string> =>
        `<span class='badge border mr-2' style='color: ${value}; background: ${value};'>C</span>`,
    },
  ]);
</script>

<svelte:head>
  <title>Formula 11 - Teams</title>
</svelte:head>

<div class="pb-2">
  <Button width="w-full" color="tertiary" onclick={team_handler} shadow>
    <span class="font-bold">Create New Team</span>
  </Button>
</div>
{#await data.teams then teams}
  <Table
    data={teams}
    columns={teams_columns}
    handler={team_handler}
    height="h-[calc(100vh-260px)] lg:h-[calc(100vh-180px)]"
  />
{/await}
