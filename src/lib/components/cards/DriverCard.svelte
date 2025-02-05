<script lang="ts">
  import { get_image_preview_event_handler } from "$lib/image";
  import {
    FileDropzone,
    getModalStore,
    SlideToggle,
    type ModalStore,
  } from "@skeletonlabs/skeleton";
  import { Button, Input, Card, Dropdown } from "$lib/components";
  import type { Driver } from "$lib/schema";
  import { DRIVER_HEADSHOT_HEIGHT, DRIVER_HEADSHOT_WIDTH } from "$lib/config";
  import { team_dropdown_options } from "$lib/dropdown";
  import { enhance } from "$app/forms";
  import { get_driver_headshot_template } from "$lib/database";

  interface DriverCardProps {
    /** Data passed from the page context */
    data: any;

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

  const required: boolean = $derived(!driver);
  const disabled: boolean = $derived(!data.admin);
  const labelwidth: string = "120px";

  let team_select_value: string = $state(driver?.team ?? "");
  let active_value: boolean = $state(driver?.active ?? true);
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
    <form
      method="POST"
      enctype="multipart/form-data"
      use:enhance
      onsubmit={() => modalStore.close()}
    >
      <!-- This is also disabled, because the ID should only be -->
      <!-- "leaked" to users that are allowed to use the inputs -->
      {#if driver && !disabled}
        <input name="id" type="hidden" value={driver.id} />
      {/if}

      <div class="flex flex-col gap-2">
        <!-- Driver name input -->
        <Input name="firstname" value={driver?.firstname ?? ""} {labelwidth} {disabled} {required}>
          First Name
        </Input>
        <Input
          name="lastname"
          value={driver?.lastname ?? ""}
          autocomplete="off"
          {labelwidth}
          {disabled}
          {required}
        >
          Last Name
        </Input>
        <Input
          name="code"
          value={driver?.code ?? ""}
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
            name="team"
            input_variable={team_select_value}
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
            <Button formaction="?/update_driver" color="secondary" {disabled} submit width="w-1/2">
              Save
            </Button>
            <Button formaction="?/delete_driver" color="primary" {disabled} submit width="w-1/2">
              Delete
            </Button>
          {:else}
            <Button formaction="?/create_driver" color="tertiary" {disabled} submit width="w-full">
              Create Driver
            </Button>
          {/if}
        </div>
      </div>
    </form>
  </Card>
{/await}
