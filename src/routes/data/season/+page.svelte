<script lang="ts">
  import { Input, Button, Card, Search, Dropdown } from "$lib/components";
  import { get_image_preview_event_handler } from "$lib/image";
  import { get_by_id } from "$lib/database";
  import type { Driver, Team } from "$lib/schema";
  import { type PageData, type ActionData } from "./$types";
  import { FileDropzone, Tab, TabGroup, type AutocompleteOption } from "@skeletonlabs/skeleton";

  // TODO: Why does this work but import { type DropdownOption } from "$lib/components" does not?
  import type { DropdownOption } from "$lib/components/Dropdown.svelte";

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let current_tab: number = $state(0);
  if (form?.tab) {
    // console.log(`Form returned current_tab=${form.current_tab}`);
    current_tab = form.tab;
  }

  // Maps driver to team: <driver.id, team.id>
  let create_driver_team_select_value: string = $state("");
  let update_driver_team_select_values: { [key: string]: string } = $state({});
  data.drivers.forEach((driver: Driver) => {
    update_driver_team_select_values[driver.id] = driver.team;
  });

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
          <Card imgsrc={team.logo_url} imgid="update_team_logo_preview_{team.id}">
            <form method="POST" enctype="multipart/form-data">
              {#if data.admin}
                <input name="id" type="hidden" value={team.id} />
              {/if}

              <div class="flex flex-col gap-2">
                <Input id="team_name_{team.id}" name="name" value={team.name} disabled={!data.admin}
                  >Name</Input
                >

                <!-- Logo upload -->
                <FileDropzone
                  name="logo"
                  id="team_logo_{team.id}"
                  onchange={get_image_preview_event_handler(`update_team_logo_preview_${team.id}`)}
                  disabled={!data.admin}
                >
                  <svelte:fragment slot="message"
                    ><b>Upload Logo</b> or Drag and Drop</svelte:fragment
                  >
                </FileDropzone>

                <!-- Buttons -->
                <div class="flex justify-end gap-2">
                  <Button formaction="?/update_team" color="secondary" disabled={!data.admin} submit
                    >Save Changes</Button
                  >
                  <Button color="primary" submit disabled={!data.admin} formaction="?/delete_team"
                    >Delete</Button
                  >
                </div>
              </div>
            </form>
          </Card>
        {/each}

        <!-- Add a new team -->
        {#if data.admin}
          <Card imgsrc="" imgid="create_team_logo_preview" imghidden>
            <form method="POST" enctype="multipart/form-data">
              <div class="flex flex-col gap-2">
                <h4 class="h4 select-none">Add a New Team</h4>

                <!-- Team name input -->
                <Input id="team_name_create" name="name" required>Name</Input>

                <!-- Logo upload -->
                <FileDropzone
                  name="logo"
                  id="team_logo_create"
                  onchange={get_image_preview_event_handler("create_team_logo_preview")}
                  disabled={!data.admin}
                  required
                >
                  <svelte:fragment slot="message"
                    ><b>Upload Logo</b> or Drag and Drop</svelte:fragment
                  >
                </FileDropzone>

                <!-- Buttons -->
                <div class="flex justify-end gap-2">
                  <!-- By specifying the formaction on the button (instead of action on the form), -->
                  <!-- we can have multiple buttons with different actions in a single form. -->

                  <Button formaction="?/create_team" color="secondary" submit>Create</Button>
                </div>
              </div>
            </form>
          </Card>
        {/if}
      </div>
    {:else if current_tab === 1}
      <!-- Drivers Tab -->
      <!-- Drivers Tab -->
      <!-- Drivers Tab -->

      <div class="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <!-- List all drivers inside the database -->
        {#each data.drivers as driver}
          <Card imgsrc={driver.headshot_url} imgid="update_driver_headshot_preview_{driver.id}">
            <form method="POST" enctype="multipart/form-data">
              {#if data.admin}
                <input name="id" type="hidden" value={driver.id} />
              {/if}

              <div class="flex flex-col gap-2">
                <!-- Driver data input -->
                <Input
                  id="driver_first_name_{driver.id}"
                  name="firstname"
                  value={driver.firstname}
                  labelwidth="120px"
                  disabled={!data.admin}>First Name</Input
                >
                <Input
                  id="driver_last_name_{driver.id}"
                  name="lastname"
                  value={driver.lastname}
                  labelwidth="120px"
                  disabled={!data.admin}>Last Name</Input
                >
                <Input
                  id="driver_code_{driver.id}"
                  name="code"
                  value={driver.code}
                  labelwidth="120px"
                  disabled={!data.admin}>Driver Code</Input
                >

                <!-- Driver team input -->
                <Dropdown
                  name="team"
                  input_variable={update_driver_team_select_values[driver.id]}
                  labelwidth="120px"
                  options={driver_team_select_options}>Team</Dropdown
                >

                <!-- Headshot upload -->
                <FileDropzone
                  name="headshot"
                  id="driver_headshot_{driver.id}"
                  onchange={get_image_preview_event_handler(
                    `update_driver_headshot_preview_${driver.id}`,
                  )}
                  disabled={!data.admin}
                >
                  <svelte:fragment slot="message"
                    ><b>Upload Headshot</b> or Drag and Drop</svelte:fragment
                  >
                </FileDropzone>

                <!-- Buttons -->
                <div class="flex justify-end gap-2">
                  <Button
                    formaction="?/update_driver"
                    color="secondary"
                    disabled={!data.admin}
                    submit>Save Changes</Button
                  >
                  <Button formaction="?/delete_driver" color="primary" disabled={!data.admin} submit
                    >Delete</Button
                  >
                </div>
              </div>
            </form>
          </Card>
        {/each}

        <!-- Add a new driver -->
        {#if data.admin}
          <Card imgsrc="" imgid="create_driver_headshot_preview" imghidden>
            <form method="POST" enctype="multipart/form-data">
              <div class="flex flex-col gap-2">
                <h4 class="h4 select-none">Add a New Driver</h4>

                <!-- Driver data input -->
                <Input
                  id="driver_first_name_create"
                  name="firstname"
                  labelwidth="120px"
                  disabled={!data.admin}
                  required>First Name</Input
                >
                <Input
                  id="driver_last_name_create"
                  name="lastname"
                  labelwidth="120px"
                  disabled={!data.admin}
                  required>Last Name</Input
                >
                <Input
                  id="driver_code_create"
                  name="code"
                  labelwidth="120px"
                  disabled={!data.admin}
                  maxlength={3}
                  minlength={3}
                  required>Driver Code</Input
                >

                <!-- Driver team input -->
                <Dropdown
                  input_variable={create_driver_team_select_value}
                  name="team"
                  labelwidth="120px"
                  options={driver_team_select_options}
                  required>Team</Dropdown
                >

                <!-- Headshot upload -->
                <FileDropzone
                  name="headshot"
                  id="driver_headshot_create"
                  onchange={get_image_preview_event_handler("create_driver_headshot_preview")}
                  disabled={!data.admin}
                  required
                >
                  <svelte:fragment slot="message"
                    ><b>Upload Headshot</b> or Drag and Drop</svelte:fragment
                  >
                </FileDropzone>

                <!-- Buttons -->
                <div class="flex justify-end gap-2">
                  <Button formaction="?/create_driver" color="secondary" submit>Create</Button>
                </div>
              </div>
            </form>
          </Card>
        {/if}
      </div>
    {:else if current_tab === 2}
      <!-- Races Tab -->
      <!-- Races Tab -->
      <!-- Races Tab -->

      <span>Races</span>
    {:else if current_tab === 3}
      <!-- Substitutions Tab -->
      <!-- Substitutions Tab -->
      <!-- Substitutions Tab -->

      <span>Substitutions</span>
    {/if}
  </svelte:fragment>
</TabGroup>
