<script lang="ts">
  import {
    Autocomplete,
    popup,
    type AutocompleteOption,
    type PopupSettings,
  } from "@skeletonlabs/skeleton";
  import type { Snippet } from "svelte";
  import { v4 as uuid } from "uuid";

  interface SearchProps {
    children: Snippet;

    /** Placeholder for the empty input element */
    placeholder?: string;

    /** Form name of the input element, to reference input data after form submission */
    name?: string;

    /** Manually set the label width, to align multiple inputs vertically. Supply value in CSS units. */
    labelwidth?: string;

    /** The variable to bind to the input element. Has to be a [$state] so its value can be updated with the input element's contents. */
    input_variable: string;

    /** The ID of the input element. UUID by default. */
    input_id?: string;

    /** The ID of the popup to trigger. UUID by default. */
    popup_id?: string;

    /** The [PopupSettings] object for the popup to trigger. */
    popup_settings?: PopupSettings;

    /** The event handler updating the [input_variable] after selection. */
    selection_handler?: (event: CustomEvent<AutocompleteOption<string>>) => void;

    /** The options this autocomplete component allows to choose from.
     * Example: [[{ label: "Aston", value: "0" }, { label: "VCARB", value: "1" }]].
     */
    options: AutocompleteOption<string, unknown>[];
  }

  let {
    children,
    placeholder = "",
    name = "",
    labelwidth = "auto",
    input_variable,
    input_id = uuid(),
    popup_id = uuid(),
    popup_settings = {
      event: "focus-click",
      target: popup_id,
      placement: "bottom",
    },
    selection_handler = (event: CustomEvent<AutocompleteOption<string>>): void => {
      input_variable = event.detail.label;
    },
    options,
  }: SearchProps = $props();
</script>

<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
  <div
    class="input-group-shim select-none text-nowrap text-neutral-900"
    style="width: {labelwidth};"
  >
    {@render children()}
  </div>
  <input
    id={input_id}
    type="search"
    {placeholder}
    {name}
    bind:value={input_variable}
    use:popup={popup_settings}
  />
</div>

<div data-popup={popup_id} class="card z-10 w-auto p-2 shadow" tabindex="-1">
  <Autocomplete bind:input={input_variable} {options} on:selection={selection_handler} />
</div>
