<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLSelectAttributes } from "svelte/elements";
  import { type DropdownOption } from "$lib/components";

  interface DropdownProps extends HTMLSelectAttributes {
    children: Snippet;

    /** Manually set the label width, to align multiple inputs vertically. Supply value in CSS units. */
    labelwidth?: string;

    /** The variable to bind to the input element. Has to be a [$state] so its value can be updated with the input element's contents. */
    value?: string;

    /** The options this autocomplete component allows to choose from.
     * Example: [[{ label: "Aston", value: "0" }, { label: "VCARB", value: "1" }]].
     */
    options: DropdownOption[];
  }

  let {
    children,
    labelwidth = "auto",
    value = $bindable(),
    options,
    ...restProps
  }: DropdownProps = $props();
</script>

<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
  <div
    class="input-group-shim select-none text-nowrap text-neutral-900"
    style="width: {labelwidth};"
  >
    {@render children()}
  </div>
  <select bind:value class="!outline-none" {...restProps}>
    {#each options as option}
      <option value={option.value} selected={value === option.value}>
        {option.label}
      </option>
    {/each}
  </select>
</div>
