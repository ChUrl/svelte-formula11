<script lang="ts">
  import { page } from "$app/stores";
  import type { Snippet } from "svelte";
  import { popup, type PopupSettings } from "@skeletonlabs/skeleton";

  const is_at_path = (path: string): boolean => {
    const pathname: string = $page.url.pathname;
    // return pathname === path;
    return pathname.endsWith(path);
  };

  interface ButtonProps {
    children: Snippet;

    /** The main color variant, e.g. "primary" or "secondary". */
    color?: string;

    /** Set the button type to "submit" (otherwise "button"). Only if "href" is undefined. */
    submit?: boolean;

    /** Make the button act as a link. */
    href?: string;

    /** Add a width class to the button. */
    width?: string;

    /** Enable the button's ":hover" state manually. */
    activate?: boolean;

    /** Enable the button's ":hover" state if the current URL matches the "href". Only if "href" is defined. */
    activate_href?: boolean;

    /** The PopupSettings to trigger on click. Only if "href" is undefined. */
    trigger_popup?: PopupSettings;

    /** Should the button have a shadow? */
    shadow?: boolean;

    /** Additional classes to insert */
    extraclass?: string;
  }

  let {
    children,
    color = undefined,
    submit = false,
    href = undefined,
    width = "w-auto",
    activate = false,
    activate_href = false,
    trigger_popup = { event: "click", target: "invalid" },
    shadow = false,
    extraclass = "",
    ...restProps
  }: ButtonProps = $props();
</script>

{#if href}
  <a
    {href}
    class="btn m-0 select-none px-2 py-2 {color ? `variant-filled-${color}` : ''} {width} {activate
      ? 'btn-hover'
      : ''} {activate_href && is_at_path(href) ? 'btn-hover' : ''} {shadow
      ? 'shadow'
      : ''} {extraclass}"
    {...restProps}>{@render children()}</a
  >
{:else}
  <button
    type={submit ? "submit" : "button"}
    class="btn select-none px-2 py-2 {color ? `variant-filled-${color}` : ''} {width} {activate
      ? 'btn-hover'
      : ''} {shadow ? 'shadow' : ''} {extraclass}"
    draggable="false"
    use:popup={trigger_popup}
    {...restProps}>{@render children()}</button
  >
{/if}
