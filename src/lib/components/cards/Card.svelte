<script lang="ts">
  import type { Snippet } from "svelte";
  import { LazyImage } from "$lib/components";
  import { error } from "@sveltejs/kit";

  interface CardProps {
    children: Snippet;

    /** The URL for a possible header image. Leave undefined for no header image. Set to empty string for an image not yet loaded. */
    imgsrc?: string;

    /** The width of the image. Required if imgsrc is set */
    imgwidth?: number;

    /** The height of the image. Required if imgsrc is set */
    imgheight?: number;

    /** The id of the header image element for JS access. */
    imgid?: string;

    /** Hide the header image element. It can be shown by removing the "hidden" property using JS and the imgid. */
    imghidden?: boolean;

    /** The width class for the card, defaults to [w-auto] */
    width?: string;
  }

  let {
    children,
    imgsrc = undefined,
    imgwidth = undefined,
    imgheight = undefined,
    imgid = undefined,
    imghidden = false,
    width = "w-auto",
    ...restProps
  }: CardProps = $props();

  if (imgsrc && (!imgwidth || !imgheight)) {
    error(400, "imgwidth and imgheight need to be specified when setting an imgsrc!");
  }
</script>

<div class="card {width} overflow-hidden bg-white shadow">
  <!-- Allow empty strings for images that only appear after user action -->
  {#if imgsrc !== undefined}
    <LazyImage
      id={imgid}
      src={imgsrc}
      alt="Card header"
      draggable="false"
      class="select-none shadow"
      hidden={imghidden}
      imgwidth={imgwidth ?? 0}
      imgheight={imgheight ?? 0}
    />
  {/if}

  <div class="p-2" {...restProps}>
    {@render children()}
  </div>
</div>
