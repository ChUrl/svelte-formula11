<script lang="ts">
  import { get_image_preview_event_handler } from "$lib/image";
  import { FileDropzone } from "@skeletonlabs/skeleton";
  import Card from "./Card.svelte";
  import Button from "./Button.svelte";
  import type { Driver } from "$lib/schema";
  import Input from "./Input.svelte";
  import Dropdown, { type DropdownOption } from "./Dropdown.svelte";

  interface DriverCardProps {
    /** The [Driver] object used to prefill values. */
    driver?: Driver | undefined;

    /** Disable all inputs if [true] */
    disable_inputs?: boolean;

    /** Require all inputs if [true] */
    require_inputs?: boolean;

    /** The [src] of the driver headshot template preview */
    headshot_template?: string;

    // TODO: Move into this component?

    /** The value this component's team select dropdown will bind to */
    team_select_value: string;

    /** The options this component's team select dropdown will display */
    team_select_options: DropdownOption[];
  }

  let {
    driver = undefined,
    disable_inputs = false,
    require_inputs = false,
    headshot_template = "",
    team_select_value,
    team_select_options,
  }: DriverCardProps = $props();
</script>

<Card
  imgsrc={driver?.headshot_url ?? headshot_template}
  imgid="update_driver_headshot_preview_{driver?.id ?? 'create'}"
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
        labelwidth="120px"
        disabled={disable_inputs}
        required={require_inputs}>First Name</Input
      >
      <Input
        id="driver_last_name_{driver?.id ?? 'create'}"
        name="lastname"
        value={driver?.lastname ?? ""}
        labelwidth="120px"
        disabled={disable_inputs}
        required={require_inputs}>Last Name</Input
      >
      <Input
        id="driver_code_{driver?.id ?? 'create'}"
        name="code"
        value={driver?.code ?? ""}
        minlength={3}
        maxlength={3}
        labelwidth="120px"
        disabled={disable_inputs}
        required={require_inputs}>Driver Code</Input
      >

      <!-- Driver team input -->
      <Dropdown
        name="team"
        input_variable={team_select_value}
        options={team_select_options}
        labelwidth="120px"
        disabled={disable_inputs}
        required={require_inputs}>Team</Dropdown
      >

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
        <svelte:fragment slot="message"><b>Upload Headshot</b> or Drag and Drop</svelte:fragment>
      </FileDropzone>

      <!-- Save/Delete buttons -->
      <div class="flex justify-end gap-2">
        {#if driver}
          <Button formaction="?/update_driver" color="secondary" disabled={disable_inputs} submit
            >Save Changes</Button
          >
          <Button color="primary" submit disabled={disable_inputs} formaction="?/delete_driver"
            >Delete</Button
          >
        {:else}
          <Button formaction="?/create_driver" color="tertiary" submit>Create Driver</Button>
        {/if}
      </div>
    </div>
  </form>
</Card>
