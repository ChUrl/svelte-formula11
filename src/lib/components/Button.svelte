<script lang="ts">
  let {
    id = "",
    name = "",
    formaction = "",
    label,
    color,
    disabled = false,
  } = $props();
</script>

<!-- HACK: Set --tw-bg-opacity to 1 so the disabled label/button looks like the disabled input -->
<button
  {id}
  {name}
  {formaction}
  {disabled}
  class="btn btn-{color}"
  style="--tw-bg-opacity: 1">{label}</button
>
