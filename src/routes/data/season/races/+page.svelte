<script lang="ts">
  import { Button, Table, type TableColumn } from "$lib/components";
  import { getModalStore, type ModalSettings, type ModalStore } from "@skeletonlabs/skeleton";
  import type { PageData } from "./$types";
  import { get_by_value } from "$lib/database";
  import type { Race } from "$lib/schema";

  let { data }: { data: PageData } = $props();

  const races_columns: TableColumn[] = [
    {
      data_value_name: "name",
      label: "Name",
      valuefun: async (value: string): Promise<string> =>
        `<span class='badge variant-filled-surface'>${value}</span>`,
    },
    { data_value_name: "step", label: "Step" },
    {
      data_value_name: "sprintqualidate",
      label: "Sprint Quali",
      valuefun: async (value: string): Promise<string> => value.slice(0, -5), // Cutoff the "Z" from the ISO datetime
    },
    {
      data_value_name: "sprintdate",
      label: "Sprint Race",
      valuefun: async (value: string): Promise<string> => value.slice(0, -5),
    },
    {
      data_value_name: "qualidate",
      label: "Quali",
      valuefun: async (value: string): Promise<string> => value.slice(0, -5),
    },
    {
      data_value_name: "racedate",
      label: "Race",
      valuefun: async (value: string): Promise<string> => value.slice(0, -5),
    },
  ];

  const modalStore: ModalStore = getModalStore();

  const races_handler = async (event: Event, id: string) => {
    const race: Race | undefined = get_by_value(await data.races, "id", id);
    if (!race) return;

    const modalSettings: ModalSettings = {
      type: "component",
      component: "raceCard",
      meta: {
        race: race,
        disable_inputs: !data.admin,
      },
    };

    modalStore.trigger(modalSettings);
  };

  const create_race_handler = async (event: Event) => {
    const modalSettings: ModalSettings = {
      type: "component",
      component: "raceCard",
      meta: {
        disable_inputs: !data.admin,
        require_inputs: true,
        pictogram_template:
          get_by_value(data.graphics, "name", "race_pictogram_template")?.file_url ?? "Invalid",
      },
    };

    modalStore.trigger(modalSettings);
  };
</script>

<div class="pb-2">
  <Button width="w-full" color="tertiary" onclick={create_race_handler} shadow>
    <span class="font-bold">Create New Race</span>
  </Button>
</div>
{#await data.races then races}
  <Table data={races} columns={races_columns} handler={races_handler} />
{/await}
