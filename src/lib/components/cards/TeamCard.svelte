<script lang="ts">
  import { get_image_preview_event_handler } from "$lib/image";
  import {
    FileDropzone,
    getModalStore,
    getToastStore,
    type ModalStore,
    type ToastStore,
  } from "@skeletonlabs/skeleton";
  import { Card, Button, Input, LazyImage } from "$lib/components";
  import type { Team } from "$lib/schema";
  import {
    TEAM_BANNER_HEIGHT,
    TEAM_BANNER_WIDTH,
    TEAM_LOGO_HEIGHT,
    TEAM_LOGO_WIDTH,
  } from "$lib/config";
  import { get_team_banner_template, get_team_logo_template } from "$lib/database";
  import { get_error_toast } from "$lib/toast";
  import { pb, pbUser } from "$lib/pocketbase";
  import { error } from "@sveltejs/kit";
  import type { PageData } from "../../../routes/data/season/teams/$types";

  interface TeamCardProps {
    /** Data from the page context */
    data: PageData;

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

  const toastStore: ToastStore = getToastStore();

  // Constants
  const labelwidth: string = "110px";

  // Reactive state
  let required: boolean = $derived(!team);
  let disabled: boolean = $derived(!$pbUser?.admin);
  let name_value: string = $state(team?.name ?? "");
  let color_value: string = $state(team?.color ?? "");
  let banner_value: FileList | undefined = $state();
  let logo_value: FileList | undefined = $state();

  // Database actions
  const update_team = (create?: boolean): (() => Promise<void>) => {
    const handler = async (): Promise<void> => {
      if (!name_value || name_value === "") {
        toastStore.trigger(get_error_toast("Please enter a name!"));
        return;
      }
      if (!color_value || color_value === "") {
        toastStore.trigger(get_error_toast("Please enter a color!"));
        return;
      }

      // Banner handling
      let banner_avif: Blob | undefined = undefined;
      const banner_file: File | undefined =
        banner_value && banner_value.length === 1 ? banner_value[0] : undefined;

      if (banner_file) {
        const banner_formdata: FormData = new FormData();
        banner_formdata.append("image", banner_file);
        banner_formdata.append("width", TEAM_BANNER_WIDTH.toString());
        banner_formdata.append("height", TEAM_BANNER_HEIGHT.toString());

        try {
          const response = await fetch("/api/compress", {
            method: "POST",
            body: banner_formdata,
          });

          if (!response.ok) {
            error(500, "Compression failed.");
          }

          banner_avif = await response.blob();
        } catch (error) {
          toastStore.trigger(get_error_toast("" + error));
        }
      }

      // Logo handling
      let logo_avif: Blob | undefined = undefined;
      const logo_file: File | undefined =
        logo_value && logo_value.length === 1 ? logo_value[0] : undefined;

      if (logo_file) {
        const logo_formdata: FormData = new FormData();
        logo_formdata.append("image", logo_file);
        logo_formdata.append("width", TEAM_LOGO_WIDTH.toString());
        logo_formdata.append("height", TEAM_LOGO_HEIGHT.toString());

        try {
          const response = await fetch("/api/compress", {
            method: "POST",
            body: logo_formdata,
          });

          if (!response.ok) {
            error(500, "Compression failed.");
          }

          logo_avif = await response.blob();
        } catch (error) {
          toastStore.trigger(get_error_toast("" + error));
        }
      }

      let team_data = {
        name: name_value,
        color: color_value,
        banner: banner_avif,
        logo: logo_avif,
      };

      // HACK: Having only a single file for the update request
      //       doesn't work with pocketbase for some reason
      if (team_data.banner === undefined) {
        delete team_data.banner;
      }
      if (team_data.logo === undefined) {
        delete team_data.logo;
      }

      try {
        if (create) {
          if (!banner_avif) {
            toastStore.trigger(get_error_toast("Please upload a single team banner!"));
            return;
          }
          if (!logo_avif) {
            toastStore.trigger(get_error_toast("Please upload a single team logo!"));
            return;
          }
          await pb.collection("teams").create(team_data);
        } else {
          if (!team?.id) {
            toastStore.trigger(get_error_toast("Invalid team id!"));
            return;
          }
          await pb.collection("teams").update(team.id, team_data);
        }
        modalStore.close();
      } catch (error) {
        toastStore.trigger(get_error_toast("" + error));
      }
    };

    return handler;
  };

  const delete_team = async (): Promise<void> => {
    if (!team?.id) {
      toastStore.trigger(get_error_toast("Invalid team id!"));
      return;
    }

    try {
      await pb.collection("teams").delete(team.id);
      modalStore.close();
    } catch (error) {
      toastStore.trigger(get_error_toast("" + error));
    }
  };
</script>

<Card
  imgsrc={team?.banner_url ?? get_team_banner_template(data.graphics)}
  imgid="banner_preview"
  width="w-full sm:w-auto"
  imgwidth={TEAM_BANNER_WIDTH}
  imgheight={TEAM_BANNER_HEIGHT}
  imgonclick={(event: Event) => modalStore.close()}
>
  <div class="flex flex-col gap-2">
    <!-- Team name input -->
    <Input bind:value={name_value} autocomplete="off" {labelwidth} {disabled} {required}>
      Name
    </Input>

    <!-- Team color input -->
    <Input
      bind:value={color_value}
      autocomplete="off"
      placeholder="Enter as '#XXXXXX'"
      minlength={7}
      maxlength={7}
      {labelwidth}
      {disabled}
      {required}
    >
      Color
      <span class="badge ml-2 border" style="color: {color_value}; background: {color_value}">
        C
      </span>
    </Input>

    <!-- Banner upload -->
    <FileDropzone
      name="banner"
      bind:files={banner_value}
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
      bind:files={logo_value}
      onchange={get_image_preview_event_handler("logo_preview")}
      {disabled}
      {required}
    >
      <svelte:fragment slot="message">
        <div class="inline-flex flex-nowrap items-center gap-2">
          <span class="font-bold">Upload Logo</span>
          <LazyImage
            src={team?.logo_url ?? get_team_logo_template(data.graphics)}
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
        <Button onclick={update_team()} color="secondary" {disabled} width="w-1/2">Save</Button>
        <Button onclick={delete_team} color="primary" {disabled} width="w-1/2">Delete</Button>
      {:else}
        <Button onclick={update_team(true)} color="tertiary" {disabled} width="w-full">
          Create Team
        </Button>
      {/if}
    </div>
  </div>
</Card>
