<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  interface InputProps extends HTMLInputAttributes {
    children: Snippet;

    /** Manually set the label width, to align multiple inputs vertically. Supply value in CSS units. */
    labelwidth?: string;

    /** The variable to bind to the input element. Has to be a [$state] so its value can be updated with the input element's contents. */
    value?: string;

    /** The type of the input element, e.g. "text". */
    type?: string;

    /** An optional element at the end of the input group */
    tail?: Snippet;
  }

  let {
    children,
    labelwidth = "auto",
    value = $bindable(),
    type = "text",
    tail = undefined,
    ...restProps
  }: InputProps = $props();
</script>

<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
  <div
    class="input-group-shim select-none text-nowrap text-neutral-900"
    style="width: {labelwidth};"
  >
    {@render children()}
  </div>
  <input bind:value class="{tail ? '!border-r' : ''} !border-l" {type} {...restProps} />
  {#if tail}
    {@render tail()}
  {/if}
</div>
