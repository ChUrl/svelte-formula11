<script lang="ts">
  import type { HTMLImgAttributes } from "svelte/elements";
  import { lazyload } from "$lib/lazyload";
  import { fetch_image_base64 } from "$lib/image";

  interface LazyImageProps extends HTMLImgAttributes {
    /** The URL to the image resource to lazyload */
    src: string;

    /** The aspect ratio width used to reserve image space (while its loading) */
    imgwidth: number;

    /** The aspect ratio height used to reserve image space (while its loading) */
    imgheight: number;

    /** Optional extra style for the <img> element  */
    imgstyle?: string;

    /** Optional extra style for the lazy <div> container */
    containerstyle?: string;

    /** Additional classes to insert for container + image */
    imgclass?: string;

    /** Slightly zoom the image on mouse-hover */
    hoverzoom?: boolean;
  }

  let {
    src,
    imgwidth,
    imgheight,
    imgstyle = undefined,
    containerstyle = undefined,
    imgclass = "",
    hoverzoom = false,
    ...restProps
  }: LazyImageProps = $props();

  // Once the image is visible, this will be set to true, triggering the loading
  let load: boolean = $state(false);

  const lazy_visible_handler = () => {
    load = true;
  };

  // Once the image component is mounted (e.g. when the image has loaded),
  // transition the opacity to fade-in the image
  const img_opacity_handler = (node: HTMLElement) => {
    setTimeout(() => (node.style.opacity = "1"), 20);
  };
</script>

<!-- Show a correctly sized div so the layout doesn't jump. -->
<div
  use:lazyload
  onLazyVisible={lazy_visible_handler}
  class="overflow-hidden {imgclass}"
  style="aspect-ratio: {imgwidth} / {imgheight}; max-width: {imgwidth}px; max-height: {imgheight}px; {containerstyle ??
    ''}"
>
  {#if load}
    {#await fetch_image_base64(src) then data}
      <img
        src={data}
        use:img_opacity_handler
        class="bg-surface-100 transition-all {imgclass} {hoverzoom ? 'hover:scale-105' : ''}"
        style="opacity: 0; transition-duration: 300ms; {imgstyle ?? ''}"
        draggable="false"
        {...restProps}
      />
    {/await}
  {/if}
</div>
