<script lang="ts">
  import { get_image_preview_event_handler } from "$lib/image";
  import { FileDropzone } from "@skeletonlabs/skeleton";
  import Button from "./Button.svelte";
  import type { Team } from "$lib/schema";
  import Input from "./Input.svelte";
  import { TEAM_LOGO_HEIGHT, TEAM_LOGO_WIDTH } from "$lib/config";
  import LazyCard from "./LazyCard.svelte";

  interface TeamCardProps {
    /** The [Team] object used to prefill values. */
    team?: Team | undefined;

    /** Disable all inputs if [true] */
    disable_inputs?: boolean;

    /** Require all inputs if [true] */
    require_inputs?: boolean;

    /** The [src] of the team logo template preview */
    logo_template?: string;
  }

  let {
    team = undefined,
    disable_inputs = false,
    require_inputs = false,
    logo_template = "",
  }: TeamCardProps = $props();
</script>

<LazyCard
  group="TeamCard"
  imgsrc={team?.logo_url ?? logo_template}
  imgwidth={TEAM_LOGO_WIDTH}
  imgheight={TEAM_LOGO_HEIGHT}
  imgid="update_team_logo_preview_{team?.id ?? 'create'}"
>
  <form method="POST" enctype="multipart/form-data">
    <!-- This is also disabled, because the ID should only be -->
    <!-- "leaked" to users that are allowed to use the inputs -->
    {#if team && !disable_inputs}
      <input name="id" type="hidden" value={team.id} />
    {/if}

    <div class="flex flex-col gap-2">
      <!-- Team name input -->
      <Input
        id="team_name_{team?.id ?? 'create'}"
        name="name"
        value={team?.name ?? ""}
        autocomplete="off"
        disabled={disable_inputs}
        required={require_inputs}
      >
        Name
      </Input>

      <!-- Logo upload -->
      <FileDropzone
        name="logo"
        id="team_logo_{team?.id ?? 'create'}"
        onchange={get_image_preview_event_handler(
          `update_team_logo_preview_${team?.id ?? "create"}`,
        )}
        disabled={disable_inputs}
        required={require_inputs}
      >
        <svelte:fragment slot="message"><b>Upload Logo</b> or Drag and Drop</svelte:fragment>
      </FileDropzone>

      <!-- Save/Delete buttons -->
      <div class="flex justify-end gap-2">
        {#if team}
          <Button formaction="?/update_team" color="secondary" disabled={disable_inputs} submit>
            Save Changes
          </Button>
          <Button color="primary" submit disabled={disable_inputs} formaction="?/delete_team">
            Delete
          </Button>
        {:else}
          <Button formaction="?/create_team" color="tertiary" submit>Create Team</Button>
        {/if}
      </div>
    </div>
  </form>
</LazyCard>
