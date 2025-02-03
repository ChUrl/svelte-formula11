<script lang="ts">
  import { Button, type TableColumn, Table } from "$lib/components";
  import { get_by_value } from "$lib/database";
  import type { Driver, Team } from "$lib/schema";
  import { getModalStore, type ModalSettings, type ModalStore } from "@skeletonlabs/skeleton";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const update_driver_team_select_values: { [key: string]: string } = $state({}); // <driver.id, team.id>
  const update_driver_active_values: { [key: string]: boolean } = $state({});
  data.drivers.then((drivers: Driver[]) =>
    drivers.forEach((driver: Driver) => {
      update_driver_team_select_values[driver.id] = driver.team;
      update_driver_active_values[driver.id] = driver.active;
    }),
  );
  update_driver_team_select_values["create"] = "";
  update_driver_active_values["create"] = true;

  const drivers_columns: TableColumn[] = [
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
        const team: Team | undefined = get_by_value(data.teams, "id", value);
        return team
          ? `<span class='badge border mr-2' style='color: ${team.color}; background: ${team.color};'>C</span>${team.name}`
          : "<span class='badge variant-filled-primary'>Invalid</span>";
      },
    },
    {
      data_value_name: "active",
      label: "Active",
      valuefun: async (value: boolean): Promise<string> =>
        `<span class='badge variant-filled-${value ? "tertiary" : "primary"} text-center' style='width: 36px;'>${value ? "Yes" : "No"}</span>`,
    },
  ];

  const modalStore: ModalStore = getModalStore();

  /** Shows the DriverCard modal to edit the clicked driver */
  const drivers_handler = async (event: Event, id: string) => {
    const driver: Driver | undefined = get_by_value(await data.drivers, "id", id);
    if (!driver) return;

    const modalSettings: ModalSettings = {
      type: "component",
      component: "driverCard",
      meta: {
        driver: driver,
        teams: data.teams,
        team_select_value: update_driver_team_select_values[driver.id],
        active_value: update_driver_active_values[driver.id],
        disable_inputs: !data.admin,
      },
    };

    modalStore.trigger(modalSettings);
  };

  const create_driver_handler = async (event: Event) => {
    const modalSettings: ModalSettings = {
      type: "component",
      component: "driverCard",
      meta: {
        teams: data.teams,
        team_select_value: update_driver_team_select_values["create"],
        active_value: update_driver_active_values["create"],
        disable_inputs: !data.admin,
        require_inputs: true,
        headshot_template:
          get_by_value(data.graphics, "name", "driver_headshot_template")?.file_url ?? "Invalid",
      },
    };

    modalStore.trigger(modalSettings);
  };
</script>

<div class="pb-2">
  <Button width="w-full" color="tertiary" onclick={create_driver_handler} shadow>
    <span class="font-bold">Create New Driver</span>
  </Button>
</div>
{#await data.drivers then drivers}
  <Table data={drivers} columns={drivers_columns} handler={drivers_handler} />
{/await}
