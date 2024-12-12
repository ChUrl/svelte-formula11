<script lang="ts">
  import { page } from "$app/stores";
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();

  // const tab = $state($page.url.pathname.split("/").at(-1));
  const get_tab = () => {
    return $page.url.pathname.split("/").at(-1);
  };
</script>

<!-- TODO: Move this + the tablist into the +layout.svelte and select the correct tab dynamically -->
<!--       This would also allow it to be animated? Maybe? -->
<h1>Season Data</h1>

<div role="tablist" class="tabs-boxed tabs">
  <a
    href="teams"
    role="tab"
    class={get_tab() === "teams" ? "tab tab-active" : "tab"}>Teams</a
  >
  <a
    href="drivers"
    role="tab"
    class={get_tab() === "drivers" ? "tab tab-active" : "tab"}>Drivers</a
  >
  <a
    href="races"
    role="tab"
    class={get_tab() === "races" ? "tab tab-active" : "tab"}>Races</a
  >
</div>
<!-- TODO: End -->

<div>
  {@render children()}
</div>
