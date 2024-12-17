<script lang="ts">
  import type { Snippet } from "svelte";
  import LazyImage from "./LazyImage.svelte";
  import { lazyload } from "$lib/lazyload";

  interface CardProps {
    children: Snippet;

    /** The URL for a possible header image. Leave undefined for no header image. Set to empty string for an image not yet loaded. */
    imgsrc?: string | undefined;

    /** The id of the header image element for JS access. */
    imgid?: string | undefined;

    /** The aspect ratio width used to reserve image space (while its loading) */
    imgwidth: number;

    /** The aspect ratio height used to reserve image space (while its loading) */
    imgheight: number;

    /** Hide the header image element. It can be shown by removing the "hidden" property using JS and the imgid. */
    imghidden?: boolean;

    /** The aspect ratio width used to reserve card space (while its loading) */
    cardwidth: number;

    /** The aspect ratio height used to reserve card space (while its loading) */
    cardheight: number;
  }

  let {
    children,
    imgsrc = undefined,
    imgid = undefined,
    imgwidth,
    imgheight,
    imghidden = false,
    cardwidth,
    cardheight,
    ...restProps
  }: CardProps = $props();

  let load: boolean = $state(false);

  const lazy_visible_handler = () => {
    load = true;
  };
</script>

<div
  use:lazyload
  onLazyVisible={lazy_visible_handler}
  style="width: 100%; aspect-ratio: {cardwidth} / {cardheight};"
>
  <div class="card w-full overflow-hidden bg-white shadow">
    <!-- Allow empty strings for images that only appear after user action -->
    {#if imgsrc !== undefined}
      <LazyImage
        id={imgid}
        src={imgsrc}
        {imgwidth}
        {imgheight}
        alt="Card header"
        draggable="false"
        class="select-none shadow"
        hidden={imghidden}
      />
    {/if}

    <!-- Only lazyload children, as the image is already lazy (also the image fade would break) -->
    {#if load}
      <div class="p-2" {...restProps}>
        {@render children()}
      </div>
    {/if}
  </div>
</div>
