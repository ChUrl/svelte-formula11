<script lang="ts">
  import type { Snippet } from "svelte";

  interface CardProps {
    children: Snippet;

    /** The URL for a possible header image. Leave undefined for no header image. Set to empty string for an image not yet loaded. */
    imgsrc?: string | undefined;

    /** The id of the header image element for JS access. */
    imgid?: string | undefined;

    /** Hide the header image element. It can be shown by removing the "hidden" property using JS and the imgid. */
    imghidden?: boolean;

    /** Enable to give the card the "w-full" class. */
    fullwidth?: boolean;
  }

  let {
    children,
    imgsrc = undefined,
    imgid = undefined,
    imghidden = false,
    fullwidth = false,
    ...restProps
  }: CardProps = $props();
</script>

<div class="card overflow-hidden bg-white shadow {fullwidth ? 'w-full' : 'w-auto'}">
  <!-- Allow empty strings for images that only appear after user action -->
  {#if imgsrc !== undefined}
    <img
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
