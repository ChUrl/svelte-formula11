<script lang="ts">
  import type { Driver, Race, Substitution, Team } from "$lib/schema";
  import { type PageData, type ActionData } from "./$types";
  import { Tab, TabGroup } from "@skeletonlabs/skeleton";

  // TODO: Why does this work but import { type DropdownOption } from "$lib/components" does not?
  import type { DropdownOption } from "$lib/components/Dropdown.svelte";
  import { TeamCard, DriverCard, RaceCard, SubstitutionCard } from "$lib/components";
  import { get_by_value } from "$lib/database";

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
  const team_dropdown_options: DropdownOption[] = [];
  data.teams.forEach((team: Team) => {
    team_dropdown_options.push({ label: team.name, value: team.id, icon_url: team.logo_url });
  });

  // All options to create a <Dropdown> component for the drivers
  const driver_dropdown_options: DropdownOption[] = [];
  data.drivers.then((drivers: Driver[]) =>
    drivers.forEach((driver: Driver) => {
      driver_dropdown_options.push({
        label: driver.code,
        value: driver.id,
        icon_url: driver.headshot_url,
      });
    }),
  );

  // All options to create a <Dropdown> component for the races
  const race_dropdown_options: DropdownOption[] = [];
  data.races.then((races: Race[]) =>
    races.forEach((race: Race) => {
      race_dropdown_options.push({ label: race.name, value: race.id });
    }),
  );
</script>

<svelte:head>
  <title>F11 - Season Data</title>
</svelte:head>

<TabGroup
  justify="justify-center"
  active="variant-filled-primary"
  hover="hover:variant-filled-primary"
  regionList="gap-2 shadow rounded-container-token p-2"
  regionPanel="!mt-0"
  rounded="rounded-container-token"
  border=""
  class="w-full rounded-container-token"
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
      <div class="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <!-- Add a new team -->
        {#if data.admin}
          <TeamCard
            logo_template={get_by_value(data.graphics, "name", "team_template")?.file_url}
            require_inputs
          />
        {/if}

        <!-- List all teams inside the database -->
        {#each data.teams as team}
          <TeamCard {team} disable_inputs={!data.admin} />
        {/each}
      </div>
    {:else if current_tab === 1}
      <!-- Drivers Tab -->
      <!-- Drivers Tab -->
      <!-- Drivers Tab -->
      <div class="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <!-- Add a new driver -->
        {#if data.admin}
          <DriverCard
            headshot_template={get_by_value(data.graphics, "name", "driver_template")?.file_url}
            team_select_value={update_driver_team_select_values["create"]}
            team_select_options={team_dropdown_options}
            active_value={update_driver_active_values["create"]}
            require_inputs
          />
        {/if}

        <!-- List all drivers inside the database -->
        {#await data.drivers then drivers}
          {#each drivers as driver}
            <DriverCard
              {driver}
              disable_inputs={!data.admin}
              team_select_value={update_driver_team_select_values[driver.id]}
              team_select_options={team_dropdown_options}
              active_value={update_driver_active_values[driver.id]}
            />
          {/each}
        {/await}
      </div>
    {:else if current_tab === 2}
      <!-- Races Tab -->
      <!-- Races Tab -->
      <!-- Races Tab -->
      <div class="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3 2xl:grid-cols-5">
        {#if data.admin}
          <RaceCard
            pictogram_template={get_by_value(data.graphics, "name", "race_template")?.file_url}
            require_inputs
          />
        {/if}

        {#await data.races then races}
          {#each races as race}
            <RaceCard {race} disable_inputs={!data.admin} />
          {/each}
        {/await}
      </div>
    {:else if current_tab === 3}
      <!-- Substitutions Tab -->
      <!-- Substitutions Tab -->
      <!-- Substitutions Tab -->
      <div class="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {#await data.drivers then drivers}
          {#if data.admin}
            <SubstitutionCard
              {drivers}
              substitute_select_value={update_substitution_substitute_select_values["create"]}
              driver_select_value={update_substitution_for_select_values["create"]}
              race_select_value={update_substitution_race_select_values["create"]}
              driver_select_options={driver_dropdown_options}
              race_select_options={race_dropdown_options}
              headshot_template={get_by_value(data.graphics, "name", "driver_template")?.file_url}
              require_inputs
            />
          {/if}

          {#await data.substitutions then substitutions}
            {#each substitutions as substitution}
              <SubstitutionCard
                {substitution}
                {drivers}
                substitute_select_value={update_substitution_substitute_select_values[
                  substitution.id
                ]}
                driver_select_value={update_substitution_for_select_values[substitution.id]}
                race_select_value={update_substitution_race_select_values[substitution.id]}
                driver_select_options={driver_dropdown_options}
                race_select_options={race_dropdown_options}
                disable_inputs={!data.admin}
              />
            {/each}
          {/await}
        {/await}
      </div>
    {/if}
  </svelte:fragment>
</TabGroup>
