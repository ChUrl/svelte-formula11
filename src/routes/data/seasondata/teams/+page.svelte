<script lang="ts">
  import type { PageData } from "./$types";
  import { Input, Button, Card } from "$lib/components";
  import { get_image_preview_event_handler } from "$lib/image";
  import { FileDropzone } from "@skeletonlabs/skeleton";

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>F11 - Teams</title>
</svelte:head>

<div class="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
  <!-- List all teams inside the database -->
  {#each data.teams as team}
    <Card>
      <!-- Logo display -->
      <img
        id="update_team_logo_preview_{team.id}"
        src={team.logo_url}
        alt="Logo of {team.name} F1 team."
        draggable="false"
        class="select-none rounded-container-token"
      />

      <form method="POST" enctype="multipart/form-data">
        <input name="id" type="hidden" value={team.id} />

        <div class="*:mt-2">
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
            <svelte:fragment slot="message"><b>Upload Logo</b> or Drag and Drop</svelte:fragment>
          </FileDropzone>

          <!-- Buttons -->
          <div class="flex justify-end gap-2">
            <Button formaction="?/update" color="secondary" disabled={!data.admin} submit
              >Save Changes</Button
            >
            <Button formaction="?/delete" color="primary" disabled={!data.admin} submit
              >Delete</Button
            >
          </div>
        </div>
      </form>
    </Card>
  {/each}

  <!-- Add a new team -->
  {#if data.admin}
    <Card>
      <!-- Logo preview -->
      <img
        id="create_team_logo_preview"
        src=""
        alt="Logo preview"
        class="select-none"
        draggable="false"
        hidden
      />
      <form method="POST" enctype="multipart/form-data">
        <div class="*:mt-2">
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
            <svelte:fragment slot="message"><b>Upload Logo</b> or Drag and Drop</svelte:fragment>
          </FileDropzone>

          <!-- Buttons -->
          <div class="flex justify-end gap-2">
            <!-- By specifying the formaction on the button (instead of action on the form), -->
            <!-- we can have multiple buttons with different actions in a single form. -->

            <Button formaction="?/create" color="secondary" submit>Create</Button>
          </div>
        </div>
      </form>
    </Card>
  {/if}
</div>
