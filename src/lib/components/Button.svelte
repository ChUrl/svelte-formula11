<script lang="ts">
  import { page } from "$app/stores";

  const is_at_path = (path: string): boolean => {
    const pathname: string = $page.url.pathname;
    // console.log(pathname);
    return pathname === path;
  };

  let {
    children,
    color = undefined,
    submit = false,
    href = undefined,
    fullwidth = false,
    activate_href = false,
    activate_button = false,
    ...restProps
  } = $props();
</script>

{#if href}
  <a
    {href}
    class="select-none {color ? `btn px-2 variant-filled-${color}` : ''} {fullwidth
      ? 'w-full'
      : 'w-auto'}
    {activate_href && is_at_path(href) ? 'btn-hover' : ''}"
    draggable="false"
    {...restProps}
  >
    {@render children()}
  </a>
{:else}
  <button
    type={submit ? "submit" : "button"}
    class="select-none {color ? `btn px-2 variant-filled-${color}` : ''} {fullwidth
      ? 'w-full'
      : 'w-auto'}
    {activate_button ? 'btn-hover' : ''}"
    draggable="false"
    {...restProps}
  >
    {@render children()}
  </button>
{/if}
