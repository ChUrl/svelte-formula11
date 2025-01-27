<script lang="ts">
  import { Button, Table, type TableColumn } from "$lib/components";
  import type { Team } from "$lib/schema";
  import { getModalStore, type ModalSettings, type ModalStore } from "@skeletonlabs/skeleton";
  import type { PageData } from "./$types";
  import { get_by_value } from "$lib/database";

  let { data }: { data: PageData } = $props();

  const teams_columns: TableColumn[] = [
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
  ];

  const modalStore: ModalStore = getModalStore();

  const teams_handler = async (event: Event, id: string) => {
    const team: Team | undefined = get_by_value(data.teams, "id", id);
    if (!team) return;

    const modalSettings: ModalSettings = {
      type: "component",
      component: "teamCard",
      meta: {
        team: team,
        disable_inputs: !data.admin,
      },
    };

    modalStore.trigger(modalSettings);
  };

  const create_team_handler = (event: Event) => {
    const modalSettings: ModalSettings = {
      type: "component",
      component: "teamCard",
      meta: {
        banner_template:
          get_by_value(data.graphics, "name", "team_banner_template")?.file_url ?? "Invalid",
        logo_template:
          get_by_value(data.graphics, "name", "team_logo_template")?.file_url ?? "Invalid",
        require_inputs: true,
        disable_inputs: !data.admin,
      },
    };

    modalStore.trigger(modalSettings);
  };
</script>

<div class="pb-2">
  <Button width="w-full" color="tertiary" onclick={create_team_handler}>
    <span class="font-bold">Create New Team</span>
  </Button>
</div>
<Table data={data.teams} columns={teams_columns} handler={teams_handler} />
