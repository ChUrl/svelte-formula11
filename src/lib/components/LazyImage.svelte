<script lang="ts">
  import type { HTMLImgAttributes } from "svelte/elements";
  import { lazyload } from "$lib/lazyload";

  interface LazyImageProps extends HTMLImgAttributes {
    /** The URL to the image resource to lazyload */
    src: string;
  }

  let { src, ...restProps }: LazyImageProps = $props();

  const blobToBase64 = (blob: Blob): Promise<any> => {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  const loadImage = async (url: string): Promise<any> => {
    return await fetch(url)
      .then((response) => response.blob())
      .then((blob) => blobToBase64(blob));
  };

  const lazy_visible_handler = () => {
    load = true;
  };

  // Once the image is visible, this will be set to true, triggering the loading
  let load: boolean = $state(false);
</script>

<div use:lazyload onLazyVisible={lazy_visible_handler}>
  {#if load}
    {#await loadImage(src)}
      <!-- Loading... -->
    {:then data}
      <img src={data} {...restProps} />
    {/await}
  {/if}
</div>
