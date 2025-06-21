<script lang="ts">
  import { invalidate } from "$app/navigation";
  import { Button } from "$lib/components";
  import { pbUser } from "$lib/pocketbase";
  import { get_error_toast, get_warning_toast } from "$lib/toast";
  import { getToastStore, type ToastStore } from "@skeletonlabs/skeleton";
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();

  const toastStore: ToastStore = getToastStore();

  const scrape_message: string =
    "This will clear and redownload all data from f1.com. Please don't refresh the page during the process.";

  // This callback will be executed once the admin presses the "Proceed"-button in the warning toast
  const scrape_callback = async () => {
    const response: Response = await fetch("/api/scrape", { method: "POST" });
    invalidate("data:official");
  };

  const scrape_official_data = async () => {
    if (!$pbUser || !$pbUser.admin) {
      toastStore.trigger(get_error_toast("Only admins may perform this action!"));
      return;
    }

    // No timeout + action toast
    toastStore.trigger(get_warning_toast(scrape_message, null, "Proceed", scrape_callback));
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
