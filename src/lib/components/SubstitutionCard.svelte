<script lang="ts">
  import LazyCard from "./LazyCard.svelte";
  import Button from "./Button.svelte";
  import type { Driver, Substitution } from "$lib/schema";
  import { get_by_value } from "$lib/database";
  import LazyDropdown, { type LazyDropdownOption } from "./LazyDropdown.svelte";
  import type { Action } from "svelte/action";
  import {
    DRIVER_HEADSHOT_HEIGHT,
    DRIVER_HEADSHOT_WIDTH,
    SUBSTITUTION_CARD_ASPECT_HEIGHT,
    SUBSTITUTION_CARD_ASPECT_WIDTH,
  } from "$lib/config";

  interface SubstitutionCardProps {
    /** The [Substitution] object used to prefill values. */
    substitution?: Substitution | undefined;

    /** The drivers (to display the headshot) */
    drivers: Driver[];

    /** Disable all inputs if [true] */
    disable_inputs?: boolean;

    /** Require all inputs if [true] */
    require_inputs?: boolean;

    /** The [src] of the driver headshot template preview */
    headshot_template?: string;

    /** The value this component's substitute select dropdown will bind to */
    substitute_select_value: string;

    /** The value this component's driver select dropdown will bind to */
    driver_select_value: string;

    /** The value this component's race select dropdown will bind to */
    race_select_value: string;

    /** The options this component's substitute/driver select dropdowns will display */
    driver_select_options: LazyDropdownOption[];

    /** The options this component's race select dropdown will display */
    race_select_options: LazyDropdownOption[];
  }

  let {
    substitution = undefined,
    drivers,
    disable_inputs = false,
    require_inputs = false,
    headshot_template = "",
    substitute_select_value,
    driver_select_value,
    race_select_value,
    driver_select_options,
    race_select_options,
  }: SubstitutionCardProps = $props();

  // This action is used on the <Dropdown> element.
  // It will trigger once the Dropdown's <input> elements is mounted.
  // This way we'll receive a reference to the object so we can register our event handler.
  const register_substitute_preview_handler: Action = (node: HTMLElement) => {
    node.addEventListener("DropdownChange", update_substitute_preview);
  };

  // This event handler is registered to the Dropdown's <input> element through the action above.
  const update_substitute_preview = (event: Event) => {
    const target: HTMLInputElement = event.target as HTMLInputElement;

    // The option "label" gets put into the Dropdown's input value,
    // so we need to lookup the driver by "code".
    const src: string = get_by_value(drivers, "code", target.value)?.headshot_url || "";
    if (src) {
      const preview: HTMLImageElement = document.getElementById(
        `update_substitution_headshot_preview_${substitution?.id ?? "create"}`,
      ) as HTMLImageElement;

      if (preview) preview.src = src;
    }
  };
</script>

<LazyCard
  cardwidth={SUBSTITUTION_CARD_ASPECT_WIDTH}
  cardheight={SUBSTITUTION_CARD_ASPECT_HEIGHT}
  imgsrc={get_by_value(drivers, "id", substitution?.substitute ?? "")?.headshot_url ??
    headshot_template}
  imgwidth={DRIVER_HEADSHOT_WIDTH}
  imgheight={DRIVER_HEADSHOT_HEIGHT}
  imgid="update_substitution_headshot_preview_{substitution?.id ?? 'create'}"
>
  <form method="POST" enctype="multipart/form-data">
    <!-- This is also disabled, because the ID should only be -->
    <!-- "leaked" to users that are allowed to use the inputs -->
    {#if substitution && !disable_inputs}
      <input name="id" type="hidden" value={substitution.id} />
    {/if}

    <div class="flex flex-col gap-2">
      <!-- Substitute select -->
      <LazyDropdown
        name="substitute"
        input_variable={substitute_select_value}
        action={register_substitute_preview_handler}
        options={driver_select_options}
        labelwidth="120px"
        disabled={disable_inputs}
        required={require_inputs}
      >
        Substitute
      </LazyDropdown>

      <!-- Driver select -->
      <LazyDropdown
        name="for"
        input_variable={driver_select_value}
        options={driver_select_options}
        labelwidth="120px"
        disabled={disable_inputs}
        required={require_inputs}
        >For
      </LazyDropdown>

      <!-- Race select -->
      <LazyDropdown
        name="race"
        input_variable={race_select_value}
        options={race_select_options}
        labelwidth="120px"
        disabled={disable_inputs}
        required={require_inputs}
        >Race
      </LazyDropdown>

      <!-- Save/Delete buttons -->
      <div class="flex justify-end gap-2">
        {#if substitution}
          <Button
            formaction="?/update_substitution"
            color="secondary"
            disabled={disable_inputs}
            submit>Save Changes</Button
          >
          <Button
            color="primary"
            submit
            disabled={disable_inputs}
            formaction="?/delete_substitution">Delete</Button
          >
        {:else}
          <Button formaction="?/create_substitution" color="tertiary" submit
            >Create Substitution</Button
          >
        {/if}
      </div>
    </div>
  </form>
</LazyCard>
