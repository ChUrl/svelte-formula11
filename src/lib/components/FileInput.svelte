<script lang="ts">
  let {
    id,
    name,
    label,
    accept = "*",
    onchange = undefined,
    disabled = false,
    required = false,
  } = $props();
</script>

{#if disabled}
  <!-- HACK: Set --tw-bg-opacity to 1 so the disabled label/button looks like the disabled input -->
  <label
    for={id}
    class="btn btn-disabled mt-2 w-full"
    style="--tw-bg-opacity: 1">{label}</label
  >
{:else}
  <label for={id} class="btn btn-ghost input-bordered mt-2 w-full"
    >{label}</label
  >
{/if}
<input
  {id}
  {name}
  class="file-input file-input-bordered file-input-ghost"
  type="file"
  hidden
  {disabled}
  {required}
  {onchange}
  {accept}
/>
