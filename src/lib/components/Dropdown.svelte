<script lang="ts">
  import { ListBox, ListBoxItem, popup, type PopupSettings } from "@skeletonlabs/skeleton";
  import type { Snippet } from "svelte";
  import type { Action } from "svelte/action";
  import type { HTMLInputAttributes } from "svelte/elements";
  import { v4 as uuid } from "uuid";

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

    /** Any action to bind to the input element */
    action?: Action;

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
    action = undefined,
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

  /** Find the "label" of an option by its "value" */
  const get_label = (value: string): string | undefined => {
    return options.find((o) => o.value === value)?.label;
  };

  // Use an action to fill the "input" variable
  // required to dispatch the custom event using $effect
  let input: HTMLInputElement | undefined = undefined;
  const obtain_input: Action = (node: HTMLElement) => {
    input = node as HTMLInputElement;
  };

  // This will run everyting "input_variable" changes.
  // The event is fired when the input's value is updated via JavaScript.
  $effect(() => {
    // Just list this so SvelteKit picks it up as dependency
    input_variable;

    if (input) input.dispatchEvent(new CustomEvent("DropdownChange"));
  });
</script>

<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
  <div
    class="input-group-shim select-none text-nowrap text-neutral-900"
    style="width: {labelwidth};"
  >
    {@render children()}
  </div>
  {#if action}
    <input
      use:popup={popup_settings}
      type="button"
      style="height: 42px; text-align: start; text-indent: 12px; border-top-left-radius: 0; border-bottom-left-radius: 0;"
      use:obtain_input
      use:action
      onkeypress={(event: Event) => event.preventDefault()}
      value={get_label(input_variable) ?? placeholder}
      {...restProps}
    />
  {:else}
    <input
      use:popup={popup_settings}
      type="button"
      style="height: 42px; text-align: start; text-indent: 12px; border-top-left-radius: 0; border-bottom-left-radius: 0;"
      use:obtain_input
      onkeypress={(event: Event) => event.preventDefault()}
      value={get_label(input_variable) ?? placeholder}
      {...restProps}
    />
  {/if}
</div>

<div
  data-popup={popup_id}
  class="card z-10 w-auto overflow-y-scroll p-2 shadow"
  style="max-height: 350px;"
>
  <ListBox>
    {#each options as option}
      <ListBoxItem bind:group={input_variable} {name} value={option.value}>
        <div class="flex flex-nowrap">
          {#if option.icon_url}
            <img
              src={option.icon_url}
              alt=""
              class="mr-2 rounded"
              style="height: 24px; max-width: 64px;"
            />
          {/if}
          {option.label}
        </div>
      </ListBoxItem>
    {/each}
  </ListBox>
</div>
