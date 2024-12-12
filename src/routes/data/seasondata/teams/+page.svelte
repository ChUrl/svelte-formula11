<script lang="ts">
  import type { PageData } from "./$types";
  import { Input, FileInput, Button } from "$lib/components";
  import { get_image_preview_event_handler } from "$lib/image";

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>F11 - Teams</title>
</svelte:head>

<div
  class="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6"
>
  <!-- List all teams inside the database -->
  {#each data.teams as team}
    <div class="card card-bordered card-compact shadow">
      <!-- Logo display -->
      <figure>
        <img
          id="update_team_logo_preview_{team.id}"
          src={team.logo_url}
          alt="Logo of {team.name} F1 team."
          draggable="false"
          class="select-none"
        />
      </figure>

      <form method="POST" enctype="multipart/form-data">
        <input name="id" type="hidden" value={team.id} />

        <div class="card-body gap-0 !p-2 !pt-0">
          <Input
            id="team_name_{team.id}"
            name="name"
            value={team.name}
            label="Name:"
            disabled={!data.admin}
          />

          <!-- Logo upload -->
          <FileInput
            id="team_logo_{team.id}"
            name="logo"
            label="Upload Logo"
            onchange={get_image_preview_event_handler(
              `update_team_logo_preview_${team.id}`,
            )}
            disabled={!data.admin}
          />

          <!-- Buttons -->
          <div class="card-actions mt-2 justify-end">
            <Button
              formaction="?/update"
              color="secondary"
              label="Save Changes"
              disabled={!data.admin}
            />
            <Button
              formaction="?/delete"
              color="primary"
              label="Delete"
              disabled={!data.admin}
            />
          </div>
        </div>
      </form>
    </div>
  {/each}

  <!-- Add a new team -->
  {#if data.admin}
    <div class="card card-bordered card-compact shadow">
      <!-- Logo preview -->
      <figure>
        <img
          id="create_team_logo_preview"
          src=""
          alt="Logo preview"
          class="select-none"
          draggable="false"
          hidden
        />
      </figure>
      <form method="POST" enctype="multipart/form-data">
        <div class="card-body">
          <h2 class="card-title select-none">Add a New Team</h2>

          <!-- Team name input -->
          <Input id="team_name_create" name="name" label="Name:" required />

          <!-- Logo upload -->
          <FileInput
            id="team_logo_create"
            name="logo"
            label="Upload Logo"
            onchange={get_image_preview_event_handler(
              "create_team_logo_preview",
            )}
            required
          />

          <!-- Buttons -->
          <div class="card-actions justify-end">
            <!-- By specifying the formaction on the button (instead of action on the form), -->
            <!-- we can have multiple buttons with different actions in a single form. -->

            <button formaction="?/create" class="btn btn-secondary"
              >Create</button
            >
          </div>
        </div>
      </form>
    </div>
  {/if}
</div>
