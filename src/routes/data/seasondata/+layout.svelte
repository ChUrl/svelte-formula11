<script lang="ts">
  import { navigating, page } from "$app/stores";
  import { Tab, TabGroup } from "@skeletonlabs/skeleton";
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();

  let current_tab: number = $state(0);
  const tabs: { [tab: string]: number } = {
    teams: 0,
    drivers: 1,
    races: 2,
  };

  navigating.subscribe((nav) => {
    if (!nav?.to?.url) return;

    current_tab = tabs[nav.to.url.toString().split("/").at(-1) || "teams"];
  });
</script>

<h1>Season Data</h1>

<TabGroup justify="justify-center">
  <a href="teams"> <Tab bind:group={current_tab} name="teams" value={0}>Teams</Tab></a>
  <a href="drivers"><Tab bind:group={current_tab} name="drivers" value={1}>Drivers</Tab></a>
  <a href="races"><Tab bind:group={current_tab} name="races" value={2}>Races</Tab></a>
</TabGroup>

<div>
  {@render children()}
</div>
