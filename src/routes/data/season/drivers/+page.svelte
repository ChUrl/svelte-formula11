<script lang="ts">
  import { Button, type TableColumn, Table } from "$lib/components";
  import { get_by_value } from "$lib/database";
  import type { Driver, Team } from "$lib/schema";
  import { getModalStore, type ModalSettings, type ModalStore } from "@skeletonlabs/skeleton";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const modalStore: ModalStore = getModalStore();
  const driver_handler = async (event: Event, id?: string) => {
    const driver: Driver | undefined = get_by_value(await data.drivers, "id", id ?? "Invalid");

    if (id && !driver) return;

    const modalSettings: ModalSettings = {
      type: "component",
      component: "driverCard",
      meta: {
        data,
        driver,
      },
    };

    modalStore.trigger(modalSettings);
  };
  const teamswitch_handler = async (event: Event, id?: string) => {
    const modalSettings: ModalSettings = {
      type: "component",
      component: "teamSwitchCard",
      meta: {
        data,
      },
    };

    modalStore.trigger(modalSettings);
  };

  const drivers_columns: TableColumn[] = $derived([
    {
      data_value_name: "code",
      label: "Driver Code",
      valuefun: async (value: string): Promise<string> =>
        `<span class='badge variant-filled-surface'>${value}</span>`,
    },
    { data_value_name: "firstname", label: "First Name" },
    { data_value_name: "lastname", label: "Last Name" },
    {
      data_value_name: "team",
      label: "Team",
      valuefun: async (value: string): Promise<string> => {
        const team: Team | undefined = get_by_value(await data.teams, "id", value);
        return `<span class='badge border mr-2' style='color: ${team?.color ?? "#FFFFFF"}; background: ${team?.color ?? "#FFFFFF"};'>C</span>${team?.name ?? "Invalid"}`;
      },
    },
    {
      data_value_name: "active",
      label: "Active",
      valuefun: async (value: boolean): Promise<string> =>
        `<span class='badge variant-filled-${value ? "tertiary" : "primary"} text-center' style='width: 36px;'>${value ? "Yes" : "No"}</span>`,
    },
    {
      data_value_name: "started_active",
      label: "Started Active",
      valuefun: async (value: boolean): Promise<string> =>
        `<span class='badge variant-filled-${value ? "tertiary" : "primary"} text-center' style='width: 36px;'>${value ? "Yes" : "No"}</span>`,
    },
  ]);
</script>

<svelte:head>
  <title>Formula 11 - Drivers</title>
</svelte:head>

<div class="flex gap-2 pb-2">
  <Button width="w-full" color="tertiary" onclick={driver_handler} shadow>
    <span class="font-bold">Create New Driver</span>
  </Button>
  <Button width="w-full" color="secondary" onclick={teamswitch_handler} shadow>
    <span class="font-bold">Switch Driver Team</span>
  </Button>
</div>
{#await data.drivers then drivers}
  <Table
    data={drivers}
    columns={drivers_columns}
    handler={driver_handler}
    height="h-[calc(100vh-260px)] lg:h-[calc(100vh-180px)]"
  />
{/await}
