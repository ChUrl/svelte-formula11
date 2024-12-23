<script lang="ts">
  import { get_image_preview_event_handler } from "$lib/image";
  import {
    FileDropzone,
    getModalStore,
    SlideToggle,
    type ModalStore,
  } from "@skeletonlabs/skeleton";
  import { Button, Input, Card, Dropdown, type DropdownOption } from "$lib/components";
  import type { Driver } from "$lib/schema";

  interface DriverCardProps {
    /** The [Driver] object used to prefill values. */
    driver?: Driver | undefined;

    /** Disable all inputs if [true] */
    disable_inputs?: boolean;

    /** Require all inputs if [true] */
    require_inputs?: boolean;

    /** The [src] of the driver headshot template preview */
    headshot_template?: string;

    /** The value this component's team select dropdown will bind to */
    team_select_value: string;

    /** The options this component's team select dropdown will display */
    team_select_options: DropdownOption[];

    /** The value this component's active switch will bind to */
    active_value: boolean;
  }

  let {
    driver = undefined,
    disable_inputs = false,
    require_inputs = false,
    headshot_template = undefined,
    team_select_value,
    team_select_options,
    active_value,
  }: DriverCardProps = $props();

  const modalStore: ModalStore = getModalStore();
  if ($modalStore[0].meta) {
    const meta = $modalStore[0].meta;

    driver = meta.driver;
    team_select_value = meta.team_select_value;
    team_select_options = meta.team_select_options;
    active_value = meta.active_value;
  }
</script>

<Card
  imgsrc={driver?.headshot_url ?? headshot_template}
  imgid="update_driver_headshot_preview_{driver?.id ?? 'create'}"
  width="w-full sm:w-auto"
>
  <form method="POST" enctype="multipart/form-data">
    <!-- This is also disabled, because the ID should only be -->
    <!-- "leaked" to users that are allowed to use the inputs -->
    {#if driver && !disable_inputs}
      <input name="id" type="hidden" value={driver.id} />
    {/if}

    <div class="flex flex-col gap-2">
      <!-- Driver name input -->
      <Input
        id="driver_first_name_{driver?.id ?? 'create'}"
        name="firstname"
        value={driver?.firstname ?? ""}
        autocomplete="off"
        labelwidth="120px"
        disabled={disable_inputs}
        required={require_inputs}
        >First Name
      </Input>
      <Input
        id="driver_last_name_{driver?.id ?? 'create'}"
        name="lastname"
        value={driver?.lastname ?? ""}
        autocomplete="off"
        labelwidth="120px"
        disabled={disable_inputs}
        required={require_inputs}
        >Last Name
      </Input>
      <Input
        id="driver_code_{driver?.id ?? 'create'}"
        name="code"
        value={driver?.code ?? ""}
        autocomplete="off"
        minlength={3}
        maxlength={3}
        labelwidth="120px"
        disabled={disable_inputs}
        required={require_inputs}
        >Driver Code
      </Input>

      <!-- Driver team input -->
      <Dropdown
        name="team"
        input_variable={team_select_value}
        options={team_select_options}
        labelwidth="120px"
        disabled={disable_inputs}
        required={require_inputs}
      >
        Team
      </Dropdown>

      <!-- Headshot upload -->
      <FileDropzone
        name="headshot"
        id="driver_headshot_{driver?.id ?? 'create'}"
        onchange={get_image_preview_event_handler(
          `update_driver_headshot_preview_${driver?.id ?? "create"}`,
        )}
        disabled={disable_inputs}
        required={require_inputs}
      >
        <svelte:fragment slot="message"><b>Upload Headshot</b></svelte:fragment>
      </FileDropzone>

      <!-- Save/Delete buttons -->
      <div class="flex items-center justify-end gap-2">
        <div class="mr-auto">
          <SlideToggle
            name="active"
            background="bg-primary-500"
            active="bg-tertiary-500"
            bind:checked={active_value}
            disabled={disable_inputs}
          />
        </div>
        {#if driver}
          <Button
            formaction="?/update_driver"
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
            formaction="?/delete_driver"
            width="w-1/2"
          >
            Delete
          </Button>
        {:else}
          <Button formaction="?/create_driver" color="tertiary" submit width="w-full">
            Create Driver
          </Button>
        {/if}
      </div>
    </div>
  </form>
</Card>
