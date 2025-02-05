<script lang="ts">
  import { Card, Button, Dropdown } from "$lib/components";
  import type { Driver, Race, Substitution } from "$lib/schema";
  import { get_by_value, get_driver_headshot_template } from "$lib/database";
  import type { Action } from "svelte/action";
  import { getModalStore, type ModalStore } from "@skeletonlabs/skeleton";
  import { DRIVER_HEADSHOT_HEIGHT, DRIVER_HEADSHOT_WIDTH } from "$lib/config";
  import { driver_dropdown_options, race_dropdown_options } from "$lib/dropdown";
  import { enhance } from "$app/forms";
  import { sub } from "date-fns";

  interface SubstitutionCardProps {
    /** Data passed from the page context */
    data: any;

    /** The [Substitution] object used to prefill values. */
    substitution?: Substitution;
  }

  let { data, substitution = undefined }: SubstitutionCardProps = $props();

  const modalStore: ModalStore = getModalStore();
  if ($modalStore[0].meta) {
    const meta = $modalStore[0].meta;

    data = meta.data;
    substitution = meta.substitution;
  }

  // This is executed on mount of the element specifying the "action"
  const register_substitute_preview_handler: Action = (node: HTMLElement) =>
    node.addEventListener("DropdownChange", update_substitute_preview);

  // This event handler is registered to the Dropdown's <input> element through the action above.
  const update_substitute_preview = async (event: Event) => {
    const target: HTMLInputElement = event.target as HTMLInputElement;

    const src: string =
      get_by_value<Driver>(await data.drivers, "code", target.value)?.headshot_url ?? "";
    const img = document.getElementById("headshot_preview") as HTMLImageElement;

    // Can be null if lazyimage hasn't loaded
    if (img) img.src = src;
  };

  const active_drivers = (drivers: Driver[]): Driver[] =>
    drivers.filter((driver: Driver) => driver.active);
  const inactive_drivers = (drivers: Driver[]): Driver[] =>
    drivers.filter((driver: Driver) => !driver.active);

  const required: boolean = $derived(!substitution);
  const disabled: boolean = $derived(!data.admin);
  const labelwidth: string = "120px";

  let substitute_select_value: string = $state(substitution?.substitute ?? "");
  let driver_select_value: string = $state(substitution?.for ?? "");
  let race_select_value: string = $state(substitution?.race ?? "");
</script>

{#await data.graphics then graphics}
  {#await data.drivers then drivers}
    <Card
      imgsrc={get_by_value<Driver>(drivers, "id", substitution?.substitute ?? "")?.headshot_url ??
        get_driver_headshot_template(graphics)}
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
        {#if substitution && !disabled}
          <input name="id" type="hidden" value={substitution.id} />
        {/if}

        <div class="flex flex-col gap-2">
          <!-- Substitute select -->
          <Dropdown
            name="substitute"
            input_variable={substitute_select_value}
            action={register_substitute_preview_handler}
            options={driver_dropdown_options(inactive_drivers(drivers))}
            {labelwidth}
            {disabled}
            {required}
          >
            Substitute
          </Dropdown>

          <!-- Driver select -->
          <Dropdown
            name="for"
            input_variable={driver_select_value}
            options={driver_dropdown_options(active_drivers(drivers))}
            {labelwidth}
            {disabled}
            {required}
          >
            For
          </Dropdown>

          <!-- Race select -->
          {#await data.races then races}
            <Dropdown
              name="race"
              input_variable={race_select_value}
              options={race_dropdown_options(races)}
              {labelwidth}
              {disabled}
              {required}
            >
              Race
            </Dropdown>
          {/await}

          <!-- Save/Delete buttons -->
          <div class="flex justify-end gap-2">
            {#if substitution}
              <Button
                formaction="?/update_substitution"
                color="secondary"
                {disabled}
                submit
                width="w-1/2"
              >
                Save Changes
              </Button>
              <Button
                formaction="?/delete_substitution"
                color="primary"
                {disabled}
                submit
                width="w-1/2"
              >
                Delete
              </Button>
            {:else}
              <Button
                formaction="?/create_substitution"
                color="tertiary"
                {disabled}
                submit
                width="w-full"
              >
                Create Substitution
              </Button>
            {/if}
          </div>
        </div>
      </form>
    </Card>
  {/await}
{/await}
