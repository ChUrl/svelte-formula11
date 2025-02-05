<script lang="ts">
  import { get_image_preview_event_handler } from "$lib/image";
  import { FileDropzone, getModalStore, type ModalStore } from "@skeletonlabs/skeleton";
  import { Card, Button, Input, LazyImage } from "$lib/components";
  import type { SkeletonData, Team } from "$lib/schema";
  import { TEAM_BANNER_HEIGHT, TEAM_BANNER_WIDTH } from "$lib/config";
  import { enhance } from "$app/forms";
  import { get_team_banner_template, get_team_logo_template } from "$lib/database";

  interface TeamCardProps {
    /** Data from the page context */
    data: SkeletonData;

    /** The [Team] object used to prefill values. */
    team?: Team;
  }

  let { data, team = undefined }: TeamCardProps = $props();

  const modalStore: ModalStore = getModalStore();
  if ($modalStore[0].meta) {
    const meta = $modalStore[0].meta;

    data = meta.data;
    team = meta.team;
  }

  const required: boolean = $derived(!team);
  const disabled: boolean = $derived(!data.admin);
  const labelwidth: string = "110px";

  let colorpreview: string = $state(team?.color ?? "Invalid");
</script>

{#await data.graphics then graphics}
  <Card
    imgsrc={team?.banner_url ?? get_team_banner_template(graphics)}
    imgid="banner_preview"
    width="w-full sm:w-auto"
    imgwidth={TEAM_BANNER_WIDTH}
    imgheight={TEAM_BANNER_HEIGHT}
    imgonclick={(event: Event) => modalStore.close()}
  >
    <form
      method="POST"
      enctype="multipart/form-data"
      use:enhance
      onsubmit={() => modalStore.close()}
    >
      <!-- This is also disabled, because the ID should only be -->
      <!-- "leaked" to users that are allowed to use the inputs -->
      {#if team && !disabled}
        <input name="id" type="hidden" value={team.id} />
      {/if}

      <div class="flex flex-col gap-2">
        <!-- Team name input -->
        <Input
          name="name"
          value={team?.name ?? ""}
          autocomplete="off"
          {labelwidth}
          {disabled}
          {required}
        >
          Name
        </Input>

        <!-- Team color input -->
        <Input
          name="color"
          value={team?.color ?? ""}
          autocomplete="off"
          placeholder="Enter as '#XXXXXX'"
          minlength={7}
          maxlength={7}
          oninput={(event: Event) => {
            colorpreview = (event.target as HTMLInputElement).value;
          }}
          {labelwidth}
          {disabled}
          {required}
        >
          Color
          <span class="badge ml-2 border" style="color: {colorpreview}; background: {colorpreview}">
            C
          </span>
        </Input>

        <!-- Banner upload -->
        <FileDropzone
          name="banner"
          onchange={get_image_preview_event_handler("banner_preview")}
          {disabled}
          {required}
        >
          <svelte:fragment slot="message">
            <span class="font-bold">Upload Banner</span>
          </svelte:fragment>
        </FileDropzone>

        <!-- Logo upload -->
        <FileDropzone
          name="logo"
          onchange={get_image_preview_event_handler("logo_preview")}
          {disabled}
          {required}
        >
          <svelte:fragment slot="message">
            <div class="inline-flex flex-nowrap items-center gap-2">
              <span class="font-bold">Upload Logo</span>
              <LazyImage
                src={team?.logo_url ?? get_team_logo_template(graphics)}
                id="logo_preview"
                imgwidth={32}
                imgheight={32}
              />
            </div>
          </svelte:fragment>
        </FileDropzone>

        <!-- Save/Delete buttons -->
        <div class="flex justify-end gap-2">
          {#if team}
            <Button formaction="?/update_team" color="secondary" {disabled} submit width="w-1/2">
              Save
            </Button>
            <Button formaction="?/delete_team" color="primary" {disabled} submit width="w-1/2">
              Delete
            </Button>
          {:else}
            <Button formaction="?/create_team" color="tertiary" {disabled} submit width="w-full">
              Create Team
            </Button>
          {/if}
        </div>
      </div>
    </form>
  </Card>
{/await}
