<script lang="ts">
  let {
    id,
    name,
    label,
    placeholder = "",
    type = "text",
    value = "",
    disabled = false,
    required = false,
  } = $props();
</script>

<label
  for={id}
  class="input input-bordered mt-2 flex !cursor-default select-none items-center gap-2"
>
  {label}
  <input
    {id}
    {name}
    {type}
    class={disabled ? "pointer-events-none grow !cursor-default" : "grow"}
    {disabled}
    {required}
    {placeholder}
    {value}
  />
</label>
