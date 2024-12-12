<script lang="ts">
  let { children, fullwidth = false, ...restProps } = $props();
</script>

<div class="card bg-white p-2 shadow {fullwidth ? 'w-full' : 'w-auto'}" {...restProps}>
  {@render children()}
</div>
