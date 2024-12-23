<script lang="ts">
  import type { HTMLImgAttributes } from "svelte/elements";
  import { fetch_image_base64 } from "$lib/image";

  interface ImageProps extends HTMLImgAttributes {
    /** The URL to the image resource to load */
    src: string;
  }

  let { src, ...restProps }: ImageProps = $props();
</script>

{#await fetch_image_base64(src) then data}
  <img src={data} class="bg-surface-100 transition-opacity" {...restProps} />
{/await}
