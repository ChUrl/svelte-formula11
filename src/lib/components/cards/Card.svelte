<script lang="ts">
  import type { Snippet } from "svelte";
  import { Image } from "$lib/components";

  interface CardProps {
    children: Snippet;

    /** The URL for a possible header image. Leave undefined for no header image. Set to empty string for an image not yet loaded. */
    imgsrc?: string | undefined;

    /** The id of the header image element for JS access. */
    imgid?: string | undefined;

    /** Hide the header image element. It can be shown by removing the "hidden" property using JS and the imgid. */
    imghidden?: boolean;

    /** The width class for the card, defaults to [w-auto] */
    width?: string;
  }

  let {
    children,
    imgsrc = undefined,
    imgid = undefined,
    imghidden = false,
    width = "w-auto",
    ...restProps
  }: CardProps = $props();
</script>

<div class="card {width} overflow-hidden bg-white shadow">
  <!-- Allow empty strings for images that only appear after user action -->
  {#if imgsrc !== undefined}
    <Image
      id={imgid}
      src={imgsrc}
      alt="Card header"
      draggable="false"
      class="select-none shadow"
      hidden={imghidden}
    />
  {/if}

  <div class="p-2" {...restProps}>
    {@render children()}
  </div>
</div>
