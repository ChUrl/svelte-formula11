<script lang="ts" module>
  // The first element of a group of cards (e.g. driver cards or team cards)
  // will register its height here, once its fully loaded.
  // This height is then used as the height of following components.
  // This is necessary, because for lazy loading depending on viewport intersection,
  // the elements must have their actual height from the beginning.
  let group_heights: { [key: string]: number } = {};
</script>

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

    /** Enable to give the card the "w-full" class. */
    fullwidth?: boolean;

    /** The group this card belongs to (e.g. "driver" or "race"). All cards that have the same contents (more specifically, height) may be assigned to the same group. */
    group: string;
  }

  let {
    children,
    imgsrc = undefined,
    imgid = undefined,
    imgwidth,
    imgheight,
    imghidden = false,
    fullwidth = false,
    group,
    ...restProps
  }: CardProps = $props();

  let load: boolean = $state(false);

  const lazy_visible_handler = () => {
    load = true;
  };

  const set_group_height = (node: HTMLElement) => {
    if (group_heights[group]) return;

    group_heights[group] = node.getBoundingClientRect().height;
    // console.log(`Set card group hight: ${group}: ${group_heights[group]}px`);
  };
</script>

<!-- TODO: This component needs to know its own height, otherwise the intersection observer doesn't work -->
<!--       (all elements are visible at once, so no lazy loading...) -->
<div use:lazyload onLazyVisible={lazy_visible_handler} style="width: 100%;">
  {#if group_heights[group]}
    <!-- A card has already loaded and determined the height for cards of this group -->
    <div
      class="card overflow-hidden bg-white shadow {fullwidth ? 'w-full' : 'w-auto'}"
      style="height: {group_heights[group]}px;"
    >
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
  {:else}
    <!-- This card is the first one to load in the group, so it is not lazy-loaded to determine the height -->
    <div
      class="card overflow-hidden bg-white shadow {fullwidth ? 'w-full' : 'w-auto'}"
      use:set_group_height
    >
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
      <div class="p-2" {...restProps}>
        {@render children()}
      </div>
    </div>
  {/if}
</div>
