<script lang="ts">
  import { format_date, isodateformat, isodatetimeformat, timeformat } from "$lib/date";
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  interface InputProps extends HTMLInputAttributes {
    children: Snippet;

    /** Manually set the label width, to align multiple inputs vertically. Supply value in CSS units. */
    labelwidth?: string;

    /** The variable to bind to the input element. Has to be a [$state] so its value can be updated with the input element's contents. */
    value?: string;
  }

  let {
    children,
    labelwidth = "auto",
    value = $bindable(),
    type = "text",
    ...restProps
  }: InputProps = $props();

  // Create separate bindable values for date and time
  let dateValue: string = $state("");
  let timeValue: string = $state("");

  // When the parent value changes, update date and time
  $effect(() => {
    if (value) {
      dateValue = format_date(value, isodateformat);
      timeValue = format_date(value, timeformat);
    }
  });

  // When either date or time changes, update the parent value
  $effect(() => {
    if (dateValue && timeValue) {
      value = format_date(`${dateValue}T${timeValue}`, isodatetimeformat);
    }
  });
</script>

<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
  <div
    class="input-group-shim select-none text-nowrap border-r text-neutral-900"
    style="width: {labelwidth};"
  >
    {@render children()}
  </div>
  <input type="date" bind:value={dateValue} class="!border-r" {...restProps} />
  <input type="time" bind:value={timeValue} {...restProps} />
</div>
