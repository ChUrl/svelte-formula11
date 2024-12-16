<script lang="ts">
  import type { HTMLImgAttributes } from "svelte/elements";
  import { lazyload } from "$lib/lazyload";
  import { fetch_image_base64 } from "$lib/image";

  interface LazyImageProps extends HTMLImgAttributes {
    /** The URL to the image resource to lazyload */
    src: string;
  }

  let { src, ...restProps }: LazyImageProps = $props();

  const lazy_visible_handler = () => {
    load = true;
  };

  // Once the image is visible, this will be set to true, triggering the loading
  let load: boolean = $state(false);
</script>

<div use:lazyload onLazyVisible={lazy_visible_handler}>
  {#if load}
    {#await fetch_image_base64(src) then data}
      <img src={data} style="width: 100%" {...restProps} />
    {/await}
  {/if}
</div>
