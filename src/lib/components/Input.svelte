<script lang="ts">
  let { children, type = "text", ...restProps } = $props();
</script>

<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
  <div class="input-group-shim select-none text-nowrap text-neutral-900">
    {@render children()}
  </div>
  <input {type} {...restProps} />
</div>
