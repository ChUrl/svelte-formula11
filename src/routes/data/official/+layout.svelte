<script lang="ts">
  import { Button } from "$lib/components";
  import { pbUser } from "$lib/pocketbase";
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();

  const scrape_official_data = async () => {
    // TODO: Unauthorized toast
    if (!$pbUser || !$pbUser.admin) return;

    // TODO: Success/error toast
    const response: Response = await fetch("/api/scrape", { method: "POST" });
  };
</script>

<div class="fixed left-0 right-0 top-14 z-10 flex justify-center">
  <div
    class="mx-2 flex w-full justify-center gap-2 bg-primary-500 pb-2 pt-3 shadow rounded-bl-container-token rounded-br-container-token"
  >
    <Button href="driverstandings" color="primary" activate_href>Drivers</Button>
    <Button href="teamstandings" color="primary" activate_href>Teams</Button>
    <Button href="startinggrids" color="primary" activate_href>Grids</Button>
    <Button href="raceresults" color="primary" activate_href>Race Results</Button>
  </div>
</div>

<!-- Each child's contents will be inserted here -->
<div style="margin-top: 56px;">
  <div class="pb-2">
    <Button
      width="w-full"
      color="tertiary"
      onclick={scrape_official_data}
      shadow
      disabled={!$pbUser?.admin}
    >
      <span class="font-bold">Refresh All Data</span>
    </Button>
  </div>
  {@render children()}
</div>
