<script lang="ts">
  import { get_image_preview_event_handler } from "$lib/image";
  import {
    FileDropzone,
    getModalStore,
    getToastStore,
    SlideToggle,
    type ModalStore,
    type ToastStore,
  } from "@skeletonlabs/skeleton";
  import { Button, Input, Card, Dropdown } from "$lib/components";
  import type { Driver, SkeletonData } from "$lib/schema";
  import { DRIVER_HEADSHOT_HEIGHT, DRIVER_HEADSHOT_WIDTH } from "$lib/config";
  import { team_dropdown_options } from "$lib/dropdown";
  import { get_driver_headshot_template } from "$lib/database";
  import { get_error_toast } from "$lib/toast";
  import { pb } from "$lib/pocketbase";
  import { invalidateAll } from "$app/navigation";
  import { error } from "@sveltejs/kit";

  interface DriverCardProps {
    /** Data passed from the page context */
    data: SkeletonData;

    /** The [Driver] object used to prefill values. */
    driver?: Driver;
  }

  let { data, driver = undefined }: DriverCardProps = $props();

  const modalStore: ModalStore = getModalStore();
  if ($modalStore[0].meta) {
    const meta = $modalStore[0].meta;

    data = meta.data;
    driver = meta.driver;
  }

  const toastStore: ToastStore = getToastStore();

  // Constants
  const labelwidth: string = "120px";

  // Reactive state
  let required: boolean = $derived(!driver);
  let disabled: boolean = $derived(!data.admin);
  let firstname_input_value: string = $state(driver?.firstname ?? "");
  let lastname_input_value: string = $state(driver?.lastname ?? "");
  let code_input_value: string = $state(driver?.code ?? "");
  let team_select_value: string = $state(driver?.team ?? "");
  let headshot_file_value: FileList | undefined = $state();
  let active_value: boolean = $state(driver?.active ?? true);

  // Database actions
  const update_driver = (create?: boolean): (() => Promise<void>) => {
    const handler = async (): Promise<void> => {
      if (!firstname_input_value || firstname_input_value === "") {
        toastStore.trigger(get_error_toast("Please enter a first name!"));
        return;
      }
      if (!lastname_input_value || lastname_input_value === "") {
        toastStore.trigger(get_error_toast("Please enter a last name!"));
        return;
      }
      if (!code_input_value || code_input_value === "") {
        toastStore.trigger(get_error_toast("Please enter a driver code!"));
        return;
      }
      if (!team_select_value || team_select_value === "") {
        toastStore.trigger(get_error_toast("Please select a team!"));
        return;
      }

      // Headshot handling
      let headshot_avif: Blob | undefined = undefined;
      const headshot_file: File | undefined =
        headshot_file_value && headshot_file_value.length === 1
          ? headshot_file_value[0]
          : undefined;

      if (headshot_file) {
        const headshot_formdata: FormData = new FormData();
        headshot_formdata.append("image", headshot_file);
        headshot_formdata.append("width", DRIVER_HEADSHOT_WIDTH.toString());
        headshot_formdata.append("height", DRIVER_HEADSHOT_HEIGHT.toString());

        try {
          const response = await fetch("/api/compress", {
            method: "POST",
            body: headshot_formdata,
          });

          if (!response.ok) {
            error(500, "Compression failed.");
          }

          headshot_avif = await response.blob();
        } catch (error) {
          toastStore.trigger(get_error_toast("" + error));
        }
      }

      const driver_data = {
        firstname: firstname_input_value,
        lastname: lastname_input_value,
        code: code_input_value,
        team: team_select_value,
        active: active_value,
        headshot: headshot_avif,
      };

      try {
        if (create) {
          if (!headshot_avif) {
            toastStore.trigger(get_error_toast("Please upload a single driver headshot!"));
            return;
          }
          await pb.collection("drivers").create(driver_data);
        } else {
          if (!driver?.id) {
            toastStore.trigger(get_error_toast("Invalid driver id!"));
            return;
          }
          await pb.collection("drivers").update(driver.id, driver_data);
        }
        invalidateAll();
        modalStore.close();
      } catch (error) {
        toastStore.trigger(get_error_toast("" + error));
      }
    };

    return handler;
  };

  const delete_driver = async (): Promise<void> => {
    if (!driver?.id) {
      toastStore.trigger(get_error_toast("Invalid driver id!"));
      return;
    }

    try {
      await pb.collection("drivers").delete(driver.id);
      invalidateAll();
      modalStore.close();
    } catch (error) {
      toastStore.trigger(get_error_toast("" + error));
    }
  };
</script>

{#await data.graphics then graphics}
  <Card
    imgsrc={driver?.headshot_url ?? get_driver_headshot_template(graphics)}
    imgid="headshot_preview"
    width="w-full sm:w-auto"
    imgwidth={DRIVER_HEADSHOT_WIDTH}
    imgheight={DRIVER_HEADSHOT_HEIGHT}
    imgonclick={(event: Event) => modalStore.close()}
  >
    <div class="flex flex-col gap-2">
      <!-- Driver name input -->
      <Input
        bind:value={firstname_input_value}
        autocomplete="off"
        {labelwidth}
        {disabled}
        {required}
      >
        First Name
      </Input>
      <Input
        bind:value={lastname_input_value}
        autocomplete="off"
        {labelwidth}
        {disabled}
        {required}
      >
        Last Name
      </Input>
      <Input
        bind:value={code_input_value}
        autocomplete="off"
        minlength={3}
        maxlength={3}
        {labelwidth}
        {disabled}
        {required}
      >
        Driver Code
      </Input>

      <!-- Driver team input -->
      {#await data.teams then teams}
        <Dropdown
          bind:value={team_select_value}
          options={team_dropdown_options(teams)}
          {labelwidth}
          {disabled}
          {required}
        >
          Team
        </Dropdown>
      {/await}

      <!-- Headshot upload -->
      <FileDropzone
        name="headshot"
        bind:files={headshot_file_value}
        onchange={get_image_preview_event_handler("headshot_preview")}
        {disabled}
        {required}
      >
        <svelte:fragment slot="message">
          <span class="font-bold">Upload Headshot</span>
        </svelte:fragment>
      </FileDropzone>

      <!-- Save/Delete buttons -->
      <div class="flex items-center justify-end gap-2">
        <div class="mr-auto">
          <SlideToggle
            name="active"
            background="bg-primary-500"
            active="bg-tertiary-500"
            bind:checked={active_value}
            {disabled}
          />
        </div>
        {#if driver}
          <Button onclick={update_driver()} color="secondary" {disabled} width="w-1/2">Save</Button>
          <Button onclick={delete_driver} color="primary" {disabled} width="w-1/2">Delete</Button>
        {:else}
          <Button onclick={update_driver(true)} color="tertiary" {disabled} width="w-full">
            Create Driver
          </Button>
        {/if}
      </div>
    </div>
  </Card>
{/await}
