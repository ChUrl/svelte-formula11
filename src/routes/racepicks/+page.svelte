<script lang="ts">
  import { Button, LazyImage } from "$lib/components";
  import { getModalStore, type ModalStore } from "@skeletonlabs/skeleton";
  import type { PageData } from "./$types";
  import { RACE_PICTOGRAM_HEIGHT, RACE_PICTOGRAM_WIDTH } from "$lib/config";

  let { data }: { data: PageData } = $props();

  const modalStore: ModalStore = getModalStore();
  const create_guess_handler = async (event: Event) => {};
</script>

<div class="pb-2">
  <Button width="w-full" color="tertiary" onclick={create_guess_handler}>
    <b>Make Guess</b>
  </Button>
</div>

{#if data.currentrace}
  <div class="bg-surface-800">
    <h1>Next Race</h1>
    <div class="flex w-full gap-2 bg-surface-500">
      <div class="flex w-full gap-2 bg-surface-300">
        <LazyImage
          src={data.currentrace.pictogram_url ?? "Invalid"}
          imgwidth={RACE_PICTOGRAM_WIDTH}
          imgheight={RACE_PICTOGRAM_HEIGHT}
          containerstyle="width: 175px;"
          imgstyle="background: transparent;"
        />
        <div>
          Name: {data.currentrace.name}<br />
          Step: {data.currentrace.step}<br />
          {#if data.currentrace.sprintqualidate}
            Sprint Quali: {data.currentrace.sprintqualidate}<br />
            Sprint Race: {data.currentrace.sprintdate}<br />
          {:else}
            Sprint: No Sprint this time :)<br />
          {/if}
          Quali: {data.currentrace.qualidate}<br />
          Race: {data.currentrace.racedate}
        </div>
      </div>

      <div class="bg-surface-300">
        <!-- If the user has already made a guess for the next race, display it inside a box to the right -->
        Hello
      </div>
    </div>
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
