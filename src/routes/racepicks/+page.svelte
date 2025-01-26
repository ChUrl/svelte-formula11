<script lang="ts">
  import { Button, LazyImage } from "$lib/components";
  import { getModalStore, type ModalStore } from "@skeletonlabs/skeleton";
  import type { PageData } from "./$types";
  import { RACE_PICTOGRAM_HEIGHT, RACE_PICTOGRAM_WIDTH } from "$lib/config";
  import type { RacePick } from "$lib/schema";

  let { data }: { data: PageData } = $props();

  const modalStore: ModalStore = getModalStore();
  const create_guess_handler = async (event: Event) => {};

  const currentpick: RacePick | null =
    data.racepicks.filter(
      (racepick: RacePick) =>
        racepick.expand.user.username === data.user?.username &&
        racepick.race === data.currentrace?.id,
    )[0] ?? null;
</script>

<!-- TODO: This thing must display the boxes as a column on mobile -->
{#if data.currentrace}
  <div class="flex w-full gap-2">
    <!-- Next Guess Box -->
    <!-- TODO: Countdown -->
    <div class="w-full bg-tertiary-500 p-2 shadow rounded-container-token">
      <h1 class="text-lg font-bold">Next Race</h1>
      <div class="mt-2 flex w-full gap-2">
        <div class="border border-black p-2 rounded-container-token">
          <LazyImage
            src={data.currentrace.pictogram_url ?? "Invalid"}
            imgwidth={RACE_PICTOGRAM_WIDTH}
            imgheight={RACE_PICTOGRAM_HEIGHT}
            containerstyle="width: 175px;"
            imgstyle="background: transparent;"
          />
        </div>
        <div class="flex flex-col border border-black p-2 rounded-container-token">
          <!-- TODO: Replace the <b></b> usages with class="font-bold" elsewhere -->
          <span class="font-bold">Step {data.currentrace.step}: {data.currentrace.name}</span>
          {#if data.currentrace.sprintqualidate}
            <span>Sprint Quali: {data.currentrace.sprintqualidate}</span>
            <span>Sprint Race: {data.currentrace.sprintdate}</span>
          {:else}
            <span>Sprint: No Sprint :)</span>
          {/if}
          <span>Quali: {data.currentrace.qualidate}</span>
          <span>Race: {data.currentrace.racedate}</span>
        </div>
      </div>
    </div>

    <!-- Your Pick Box -->
    {#if currentpick}
      <div class="flex flex-col gap-2">
        <div class="w-full bg-tertiary-500 p-2 shadow rounded-container-token">
          <h1 class="text-lg font-bold">Your Pick:</h1>
          <div class="mt-2 flex flex-col border border-black p-2 rounded-container-token">
            <span class="text-nowrap">P{data.currentrace.pxx}: {currentpick.pxx}</span>
            <span class="text-nowrap">DNF: {currentpick.dnf}</span>
          </div>
        </div>

        <!-- TODO: Add other button shadows -->
        <Button
          width="w-full"
          color="tertiary"
          onclick={create_guess_handler}
          style="height: 100%;"
          shadow
        >
          <b>{currentpick ? "Edit Pick" : "Make Pick"}</b>
        </Button>
      </div>
    {/if}
  </div>
{/if}

<!-- "Make Guess"/"Update Guess" button at the top -->

<!-- Full-Width box with information about the upcoming race: -->
<!-- - Name, step, track pictogram, date of (squali), (srace), quali and race -->
<!-- - Countdown to next step (either squali, srace, quali or race) -->

<!-- "Table" of past guesses (not an actual table this time): -->
<!-- - Left column (rounded div column with race information: name, step, pxx) -->
<!--   - Show full result on-click? -->
<!-- - Rounded middle block (rest of width) with guesses: -->
<!--   - Just avatar at the top (reduce width) with points below, username on hover? -->
<!--   - Color-coded compact pxx + dnf picks (with podium + skull icons to differentiate?) -->

<!-- Make 2 variations (races as rows and races as columns) + settings toggle? -->
