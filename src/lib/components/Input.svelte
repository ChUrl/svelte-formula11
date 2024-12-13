<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  interface InputProps extends HTMLInputAttributes {
    children: Snippet;

    /** Manually set the label width, to align multiple inputs vertically. Supply value in CSS units. */
    labelwidth?: string;

    /** The type of the input element, e.g. "text". */
    type?: string;
  }

  let { children, labelwidth = "auto", type = "text", ...restProps }: InputProps = $props();
</script>

<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
  <div
    class="input-group-shim select-none text-nowrap text-neutral-900"
    style="width: {labelwidth};"
  >
    {@render children()}
  </div>
  <input {type} {...restProps} />
</div>
