<script lang="ts">
  import { page } from "$app/stores";
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { popup, type PopupSettings } from "@skeletonlabs/skeleton";

  const is_at_path = (path: string): boolean => {
    const pathname: string = $page.url.pathname;
    // console.log(pathname);
    return pathname === path;
  };

  interface ButtonProps extends HTMLButtonAttributes {
    children: Snippet;

    /** The main color variant, e.g. "primary" or "secondary". */
    color?: string | undefined;

    /** Set the button type to "submit" (otherwise "button"). Only if "href" is undefined. */
    submit?: boolean;

    /** Make the button act as a link. */
    href?: string | undefined;

    /** Add the "w-full" class to the button. */
    fullwidth?: boolean;

    /** Enable the button's ":hover" state manually. */
    activate?: boolean;

    /** Enable the button's ":hover" state if the current URL matches the "href". Only if "href" is defined. */
    activate_href?: boolean;

    /** The PopupSettings to trigger on click. Only if "href" is undefined. */
    trigger_popup?: PopupSettings;
  }

  let {
    children,
    color = undefined,
    submit = false,
    href = undefined,
    fullwidth = false,
    activate = false,
    activate_href = false,
    trigger_popup = { event: "click", target: "invalid" },
    ...restProps
  }: ButtonProps = $props();
</script>

{#if href}
  <!-- HACK: Make the button act as a link using a form -->
  <form action={href} class="contents">
    <button
      type="submit"
      class="btn m-0 select-none px-2 py-2 {color ? `variant-filled-${color}` : ''} {fullwidth
        ? 'w-full'
        : 'w-auto'} {activate ? 'btn-hover' : ''} {activate_href && is_at_path(href)
        ? 'btn-hover'
        : ''}"
      draggable="false"
      {...restProps}>{@render children()}</button
    >
  </form>
{:else}
  <button
    type={submit ? "submit" : "button"}
    class="btn select-none px-2 py-2 {color ? `variant-filled-${color}` : ''} {fullwidth
      ? 'w-full'
      : 'w-auto'} {activate ? 'btn-hover' : ''}"
    draggable="false"
    use:popup={trigger_popup}
    {...restProps}>{@render children()}</button
  >
{/if}
