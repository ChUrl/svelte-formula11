<script lang="ts">
  import { ListBox, ListBoxItem, popup, type PopupSettings } from "@skeletonlabs/skeleton";
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";
  import { v4 as uuid } from "uuid";
  import UserIcon from "./svg/UserIcon.svelte";

  export interface DropdownOption {
    label: string;
    value: string;
  }

  interface SearchProps extends HTMLInputAttributes {
    children: Snippet;

    /** Placeholder for the empty input element */
    placeholder?: string;

    /** Form name of the input element, to reference input data after form submission */
    name?: string;

    /** Manually set the label width, to align multiple inputs vertically. Supply value in CSS units. */
    labelwidth?: string;

    /** The variable to bind to the input element. Has to be a [$state] so its value can be updated with the input element's contents. */
    input_variable: string;

    /** The ID of the popup to trigger. UUID by default. */
    popup_id?: string;

    /** The [PopupSettings] object for the popup to trigger. */
    popup_settings?: PopupSettings;

    /** The options this autocomplete component allows to choose from.
     * Example: [[{ label: "Aston", value: "0" }, { label: "VCARB", value: "1" }]].
     */
    options: DropdownOption[];
  }

  let {
    children,
    placeholder = "",
    name = "",
    labelwidth = "auto",
    input_variable,
    popup_id = uuid(),
    popup_settings = {
      event: "click",
      target: popup_id,
      placement: "bottom",
      closeQuery: ".listbox-item",
    },
    options,
    ...restProps
  }: SearchProps = $props();

  const get_label = (value: string): string | undefined => {
    return options.find((o) => o.value === value)?.label;
  };
</script>

<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
  <div
    class="input-group-shim select-none text-nowrap text-neutral-900"
    style="width: {labelwidth};"
  >
    {@render children()}
  </div>
  <input
    use:popup={popup_settings}
    type="text"
    readonly
    value={get_label(input_variable) ?? placeholder}
    {...restProps}
  />
</div>

<div data-popup={popup_id} class="card z-10 w-auto p-2 shadow">
  <ListBox>
    {#each options as option}
      <ListBoxItem bind:group={input_variable} {name} value={option.value}
        >{option.label}</ListBoxItem
      >
    {/each}
  </ListBox>
  <div class="bg-surface-100-800-token arrow"></div>
</div>
