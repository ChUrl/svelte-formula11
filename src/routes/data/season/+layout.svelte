<script lang="ts">
  import { Button } from "$lib/components";
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<div class="fixed left-0 right-0 top-14 z-10 flex justify-center">
  <div
    class="mx-2 flex w-full justify-center gap-2 bg-primary-500 pb-2 pt-3 shadow rounded-bl-container-token rounded-br-container-token"
  >
    <Button href="teams" color="primary" activate_href>Teams</Button>
    <Button href="drivers" color="primary" activate_href>Drivers</Button>
    <Button href="races" color="primary" activate_href>Races</Button>
    <Button href="substitutions" color="primary" activate_href>Substitutions</Button>
  </div>
</div>

<!-- Each child's contents will be inserted here -->
<div style="margin-top: 56px;">
  {@render children()}
</div>
