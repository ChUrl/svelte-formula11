<script lang="ts">
  import { page } from "$app/stores";
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();

  // This has to be a function, so $page access is deferred to route switches
  const get_tab = () => {
    return $page.url.pathname.split("/").at(-1);
  };
</script>

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

<div>
  {@render children()}
</div>
