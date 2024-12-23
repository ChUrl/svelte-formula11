<script lang="ts">
  import type { Driver, Race, Substitution, Team } from "$lib/schema";
  import { type PageData, type ActionData } from "./$types";
  import {
    getModalStore,
    Tab,
    TabGroup,
    type ModalSettings,
    type ModalStore,
  } from "@skeletonlabs/skeleton";

  import { Table, type LazyDropdownOption, type TableColumn } from "$lib/components";
  import { get_by_value } from "$lib/database";
  import {
    DRIVER_HEADSHOT_HEIGHT,
    DRIVER_HEADSHOT_WIDTH,
    RACE_PICTOGRAM_HEIGHT,
    RACE_PICTOGRAM_WIDTH,
    TEAM_BANNER_HEIGHT,
    TEAM_BANNER_WIDTH,
  } from "$lib/config";

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let current_tab: number = $state(0);
  if (form?.tab) {
    // console.log(`Form returned current_tab=${form.current_tab}`);
    current_tab = form.tab;
  }

  // Values for driver cards
  let update_driver_team_select_values: { [key: string]: string } = $state({}); // <driver.id, team.id>
  let update_driver_active_values: { [key: string]: boolean } = $state({});
  data.drivers.then((drivers: Driver[]) =>
    drivers.forEach((driver: Driver) => {
      update_driver_team_select_values[driver.id] = driver.team;
      update_driver_active_values[driver.id] = driver.active;
    }),
  );
  update_driver_team_select_values["create"] = "";
  update_driver_active_values["create"] = true;

  // Values for substitution cards
  const update_substitution_substitute_select_values: { [key: string]: string } = $state({});
  const update_substitution_for_select_values: { [key: string]: string } = $state({});
  const update_substitution_race_select_values: { [key: string]: string } = $state({});
  data.substitutions.then((substitutions: Substitution[]) =>
    substitutions.forEach((substitution: Substitution) => {
      update_substitution_substitute_select_values[substitution.id] = substitution.substitute;
      update_substitution_for_select_values[substitution.id] = substitution.for;
      update_substitution_race_select_values[substitution.id] = substitution.race;
    }),
  );
  update_substitution_substitute_select_values["create"] = "";
  update_substitution_for_select_values["create"] = "";
  update_substitution_race_select_values["create"] = "";

  // All options to create a <Dropdown> component for the teams
  const team_dropdown_options: LazyDropdownOption[] = [];
  data.teams.forEach((team: Team) => {
    team_dropdown_options.push({
      label: team.name,
      value: team.id,
      icon_url: team.logo_url,
      icon_width: TEAM_BANNER_WIDTH,
      icon_height: TEAM_BANNER_HEIGHT,
    });
  });

  // All options to create a <Dropdown> component for the drivers
  const driver_dropdown_options: LazyDropdownOption[] = [];
  data.drivers.then((drivers: Driver[]) =>
    drivers.forEach((driver: Driver) => {
      driver_dropdown_options.push({
        label: driver.code,
        value: driver.id,
        icon_url: driver.headshot_url,
        icon_width: DRIVER_HEADSHOT_WIDTH,
        icon_height: DRIVER_HEADSHOT_HEIGHT,
      });
    }),
  );

  // All options to create a <Dropdown> component for the races
  const race_dropdown_options: LazyDropdownOption[] = [];
  data.races.then((races: Race[]) =>
    races.forEach((race: Race) => {
      race_dropdown_options.push({
        label: race.name,
        value: race.id,
        icon_url: race.pictogram_url,
        icon_width: RACE_PICTOGRAM_WIDTH,
        icon_height: RACE_PICTOGRAM_HEIGHT,
      });
    }),
  );

  const modalStore: ModalStore = getModalStore();

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

  /** Shows the DriverCard modal to edit the clicked driver */
  const drivers_handler = async (event: Event, id: string) => {
    const driver: Driver | undefined = get_by_value(await data.drivers, "id", id);
    if (!driver) return;

    const modalSettings: ModalSettings = {
      type: "component",
      component: "driverCard",
      meta: {
        driver: driver,
        team_select_value: update_driver_team_select_values[driver.id],
        team_select_options: team_dropdown_options,
        active_value: update_driver_active_values[driver.id],
        disable_inputs: !data.admin,
      },
    };

    modalStore.trigger(modalSettings);
  };

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
      valuefun: async (value: string): Promise<string> => value.slice(0, -5),
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

  const substitutions_columns: TableColumn[] = [
    {
      data_value_name: "substitute",
      label: "Substitute",
      valuefun: async (value: string): Promise<string> => {
        const substitute = get_by_value(await data.drivers, "id", value)?.code ?? "Invalid";
        return `<span class='badge variant-filled-surface'>${substitute}</span>`;
      },
    },
    {
      data_value_name: "for",
      label: "For",
      valuefun: async (value: string): Promise<string> =>
        get_by_value(await data.drivers, "id", value)?.code ?? "Invalid",
    },
    {
      data_value_name: "race",
      label: "Race",
      valuefun: async (value: string): Promise<string> =>
        get_by_value(await data.races, "id", value)?.name ?? "Invalid",
    },
  ];

  const substitutions_handler = async (event: Event, id: string) => {
    const substitution: Substitution | undefined = get_by_value(await data.substitutions, "id", id);
    if (!substitution) return;

    const modalSettings: ModalSettings = {
      type: "component",
      component: "substitutionCard",
      meta: {
        substitution: substitution,
        drivers: await data.drivers,
        substitute_select_value: update_substitution_substitute_select_values[substitution.id],
        driver_select_value: update_substitution_for_select_values[substitution.id],
        race_select_value: update_substitution_race_select_values[substitution.id],
        driver_select_options: driver_dropdown_options,
        race_select_options: race_dropdown_options,
        disable_inputs: !data.admin,
      },
    };

    modalStore.trigger(modalSettings);
  };
</script>

<svelte:head>
  <title>F11 - Season Data</title>
</svelte:head>

<TabGroup
  justify="justify-center"
  active="variant-filled-primary"
  hover="hover:variant-filled-primary"
  regionList="gap-2 shadow rounded-bl-container-token rounded-br-container-token p-2 pt-3 bg-white fixed left-2 right-2 top-14 z-10"
  regionPanel="!mt-14"
  rounded="rounded-container-token"
  border="border-none"
  padding="p-2"
>
  <Tab bind:group={current_tab} name="teams" value={0}>Teams</Tab>
  <Tab bind:group={current_tab} name="drivers" value={1}>Drivers</Tab>
  <Tab bind:group={current_tab} name="races" value={2}>Races</Tab>
  <Tab bind:group={current_tab} name="substitutions" value={3}>Substitutions</Tab>

  <svelte:fragment slot="panel">
    {#if current_tab === 0}
      <!-- Teams Tab -->
      <!-- Teams Tab -->
      <!-- Teams Tab -->
      <!-- TODO: Add team -->
      <Table data={data.teams} columns={teams_columns} handler={teams_handler} />
    {:else if current_tab === 1}
      <!-- Drivers Tab -->
      <!-- Drivers Tab -->
      <!-- Drivers Tab -->
      <!-- TODO: Add driver -->
      {#await data.drivers then drivers}
        <Table data={drivers} columns={drivers_columns} handler={drivers_handler} />
      {/await}
    {:else if current_tab === 2}
      <!-- Races Tab -->
      <!-- Races Tab -->
      <!-- Races Tab -->
      {#await data.races then races}
        <Table data={races} columns={races_columns} handler={races_handler} />
      {/await}
    {:else if current_tab === 3}
      <!-- Substitutions Tab -->
      <!-- Substitutions Tab -->
      <!-- Substitutions Tab -->
      {#await data.substitutions then substitutions}
        <Table
          data={substitutions}
          columns={substitutions_columns}
          handler={substitutions_handler}
        />
      {/await}
    {/if}
  </svelte:fragment>
</TabGroup>
