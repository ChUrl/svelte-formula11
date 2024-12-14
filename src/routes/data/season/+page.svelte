<script lang="ts">
  import { Input, Button, Card, Search, Dropdown } from "$lib/components";
  import { get_image_preview_event_handler } from "$lib/image";
  import type { Driver, Team } from "$lib/schema";
  import { type PageData, type ActionData } from "./$types";
  import { FileDropzone, Tab, TabGroup, type AutocompleteOption } from "@skeletonlabs/skeleton";

  // TODO: Why does this work but import { type DropdownOption } from "$lib/components" does not?
  import type { DropdownOption } from "$lib/components/Dropdown.svelte";
  import { get_by_value } from "$lib/database";
  import TeamCard from "$lib/components/TeamCard.svelte";
  import DriverCard from "$lib/components/DriverCard.svelte";
  import RaceCard from "$lib/components/RaceCard.svelte";

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let current_tab: number = $state(0);
  if (form?.tab) {
    // console.log(`Form returned current_tab=${form.current_tab}`);
    current_tab = form.tab;
  }

  // Maps driver to team: <driver.id, team.id>
  let update_driver_team_select_values: { [key: string]: string } = $state({});
  data.drivers.forEach((driver: Driver) => {
    update_driver_team_select_values[driver.id] = driver.team;
  });
  update_driver_team_select_values["create"] = "";

  const driver_team_select_options: DropdownOption[] = data.teams.map((team: Team) => {
    return { label: team.name, value: team.id } as DropdownOption;
  });
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
        <!-- List all teams inside the database -->
        {#each data.teams as team}
          <TeamCard {team} disable_inputs={!data.admin} />
        {/each}

        <!-- Add a new team -->
        {#if data.admin}
          <TeamCard
            logo_template={get_by_value(data.graphics, "name", "team_template")?.file_url}
            require_inputs
          />
        {/if}
      </div>
    {:else if current_tab === 1}
      <!-- Drivers Tab -->
      <!-- Drivers Tab -->
      <!-- Drivers Tab -->
      <div class="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <!-- List all drivers inside the database -->
        {#each data.drivers as driver}
          <DriverCard
            {driver}
            disable_inputs={!data.admin}
            team_select_values={update_driver_team_select_values}
            team_select_options={driver_team_select_options}
          />
        {/each}

        <!-- Add a new driver -->
        {#if data.admin}
          <DriverCard
            logo_template={get_by_value(data.graphics, "name", "driver_template")?.file_url}
            team_select_values={update_driver_team_select_values}
            team_select_options={driver_team_select_options}
            require_inputs
          />
        {/if}
      </div>
    {:else if current_tab === 2}
      <!-- Races Tab -->
      <!-- Races Tab -->
      <!-- Races Tab -->
      <div class="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3 2xl:grid-cols-5">
        {#each data.races as race}
          <RaceCard {race} disable_inputs={!data.admin} />
        {/each}

        {#if data.admin}
          <RaceCard
            pictogram_template={get_by_value(data.graphics, "name", "race_template")?.file_url}
            require_inputs
          />
        {/if}
      </div>
    {:else if current_tab === 3}
      <!-- Substitutions Tab -->
      <!-- Substitutions Tab -->
      <!-- Substitutions Tab -->
      <span>Substitutions</span>
    {/if}
  </svelte:fragment>
</TabGroup>
