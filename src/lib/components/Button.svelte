<script lang="ts">
  let {
    children,
    color,
    submit = false,
    href = undefined,
    fullwidth = false,
    ...restProps
  } = $props();
</script>

{#if href}
  <a {href} class="btn p-2 variant-filled-{color} {fullwidth ? 'w-full' : 'w-auto'}" {...restProps}>
    {@render children()}
  </a>
{:else}
  <button
    type={submit ? "submit" : "button"}
    class="btn p-2 variant-filled-{color} {fullwidth ? 'w-full' : 'w-auto'}"
    {...restProps}
  >
    {@render children()}
  </button>
{/if}
