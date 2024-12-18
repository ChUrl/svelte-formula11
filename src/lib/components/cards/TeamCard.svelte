<script lang="ts">
  import { get_image_preview_event_handler } from "$lib/image";
  import { FileDropzone } from "@skeletonlabs/skeleton";
  import { Button, Input, LazyImage } from "$lib/components";
  import type { Team } from "$lib/schema";
  import {
    TEAM_CARD_ASPECT_HEIGHT,
    TEAM_CARD_ASPECT_WIDTH,
    TEAM_BANNER_HEIGHT,
    TEAM_BANNER_WIDTH,
    TEAM_LOGO_WIDTH,
    TEAM_LOGO_HEIGHT,
  } from "$lib/config";
  import LazyCard from "./LazyCard.svelte";

  interface TeamCardProps {
    /** The [Team] object used to prefill values. */
    team?: Team | undefined;

    /** Disable all inputs if [true] */
    disable_inputs?: boolean;

    /** Require all inputs if [true] */
    require_inputs?: boolean;

    /** The [src] of the team banner template preview */
    banner_template?: string;

    /** The [src] of the team logo template preview */
    logo_template?: string;
  }

  let {
    team = undefined,
    disable_inputs = false,
    require_inputs = false,
    banner_template = "",
    logo_template = "",
  }: TeamCardProps = $props();

  const labelwidth: string = "110px";

  let colorpreview: string = $state(team?.color ?? "white");
</script>

<LazyCard
  cardwidth={TEAM_CARD_ASPECT_WIDTH}
  cardheight={TEAM_CARD_ASPECT_HEIGHT}
  imgsrc={team?.banner_url ?? banner_template}
  imgwidth={TEAM_BANNER_WIDTH}
  imgheight={TEAM_BANNER_HEIGHT}
  imgid="update_team_banner_preview_{team?.id ?? 'create'}"
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
        {labelwidth}
        autocomplete="off"
        disabled={disable_inputs}
        required={require_inputs}
      >
        Name
      </Input>

      <!-- Team color input -->
      <Input
        id="team_color_{team?.id ?? 'create'}"
        name="color"
        value={team?.color ?? ""}
        {labelwidth}
        autocomplete="off"
        disabled={disable_inputs}
        required={require_inputs}
        onchange={(event: Event) => {
          colorpreview = (event.target as HTMLInputElement).value;
        }}
      >
        Color
        <span class="badge ml-2 border" style="color: {colorpreview}; background: {colorpreview}"
          >C</span
        >
      </Input>

      <!-- Banner upload -->
      <FileDropzone
        name="banner"
        id="team_banner_{team?.id ?? 'create'}"
        onchange={get_image_preview_event_handler(
          `update_team_banner_preview_${team?.id ?? "create"}`,
        )}
        disabled={disable_inputs}
        required={require_inputs}
      >
        <svelte:fragment slot="message"><b>Upload Banner</b></svelte:fragment>
      </FileDropzone>

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
        <svelte:fragment slot="message">
          <div class="inline-flex flex-nowrap items-center gap-2">
            <b>Upload Logo</b>
            <LazyImage
              src={team?.logo_url ?? logo_template}
              imgwidth={TEAM_LOGO_WIDTH}
              imgheight={TEAM_LOGO_HEIGHT}
              imgstyle="width: 32px; height: 32px;"
              id="update_team_logo_preview_{team?.id ?? 'create'}"
            />
          </div>
        </svelte:fragment>
      </FileDropzone>

      <!-- Save/Delete buttons -->
      <div class="flex justify-end gap-2">
        {#if team}
          <Button
            formaction="?/update_team"
            color="secondary"
            disabled={disable_inputs}
            submit
            width="w-1/2"
          >
            Save
          </Button>
          <Button
            color="primary"
            submit
            disabled={disable_inputs}
            formaction="?/delete_team"
            width="w-1/2"
          >
            Delete
          </Button>
        {:else}
          <Button formaction="?/create_team" color="tertiary" submit width="w-full"
            >Create Team</Button
          >
        {/if}
      </div>
    </div>
  </form>
</LazyCard>
