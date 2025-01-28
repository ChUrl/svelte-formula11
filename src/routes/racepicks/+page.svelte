<script lang="ts">
  import { Button, ChequeredFlagIcon, LazyImage, type DropdownOption } from "$lib/components";
  import {
    Accordion,
    AccordionItem,
    getModalStore,
    type ModalSettings,
    type ModalStore,
  } from "@skeletonlabs/skeleton";
  import type { PageData } from "./$types";
  import {
    AVATAR_HEIGHT,
    AVATAR_WIDTH,
    DRIVER_HEADSHOT_HEIGHT,
    DRIVER_HEADSHOT_WIDTH,
    RACE_PICTOGRAM_HEIGHT,
    RACE_PICTOGRAM_WIDTH,
  } from "$lib/config";
  import type { CurrentPickedUser, Driver, Race, RacePick } from "$lib/schema";
  import { get_by_value } from "$lib/database";

  let { data }: { data: PageData } = $props();

  const currentpick: RacePick | undefined =
    data.racepicks.filter(
      (racepick: RacePick) =>
        racepick.expand.user.username === data.user?.username &&
        racepick.race === data.currentrace?.id,
    )[0] ?? undefined;

  let pxx_select_value: string = $state(currentpick?.pxx ?? "");
  let dnf_select_value: string = $state(currentpick?.dnf ?? "");

  // TODO: Duplicated code in cards/substitutioncard.svelte
  const driver_dropdown_options: DropdownOption[] = [];
  data.drivers.forEach((driver: Driver) => {
    driver_dropdown_options.push({
      label: driver.code,
      value: driver.id,
      icon_url: driver.headshot_url,
      icon_width: DRIVER_HEADSHOT_WIDTH,
      icon_height: DRIVER_HEADSHOT_HEIGHT,
    });
  });

  const modalStore: ModalStore = getModalStore();
  const create_guess_handler = async (event: Event) => {
    const modalSettings: ModalSettings = {
      type: "component",
      component: "racePickCard",
      meta: {
        racepick: currentpick,
        currentrace: data.currentrace,
        user: data.user,
        drivers: data.drivers,
        disable_inputs: false, // TODO: Datelock
        headshot_template:
          get_by_value(data.graphics, "name", "driver_headshot_template")?.file_url ?? "Invalid",
        pxx_select_value: pxx_select_value,
        dnf_select_value: dnf_select_value,
        driver_select_options: driver_dropdown_options,
      },
    };

    modalStore.trigger(modalSettings);
  };

  const race = (id: string): Race | undefined => get_by_value(data.races, "id", id);
  const driver = (id: string): Driver | undefined => get_by_value(data.drivers, "id", id);

  const pickedusers = data.currentpickedusers.filter(
    (currentpickeduser: CurrentPickedUser) => currentpickeduser.picked,
  );
  const outstandingusers = data.currentpickedusers.filter(
    (currentpickeduser: CurrentPickedUser) => !currentpickeduser.picked,
  );
</script>

{#if data.currentrace}
  <Accordion
    class="card mx-auto bg-tertiary-500 shadow"
    regionPanel="pt-0"
    width="w-full xl:w-[1211px]"
  >
    <AccordionItem>
      <svelte:fragment slot="lead"><ChequeredFlagIcon /></svelte:fragment>
      <svelte:fragment slot="summary">
        <span class="font-bold">Next Race Guess</span>
      </svelte:fragment>
      <svelte:fragment slot="content">
        <div class="gap-2 xl:flex">
          <!-- TODO: Make the contents into 2 columns -->
          <div class="card mt-2 flex flex-col bg-tertiary-400 p-2 shadow">
            <span class="text-nowrap font-bold">
              Step {data.currentrace.step}: {data.currentrace.name}
            </span>
            {#if data.currentrace.sprintqualidate}
              <span class="text-nowrap">Sprint Quali: {data.currentrace.sprintqualidate}</span>
              <span class="text-nowrap">Sprint Race: {data.currentrace.sprintdate}</span>
            {:else}
              <span class="text-nowrap">Sprint: No Sprint :)</span>
            {/if}
            <span class="text-nowrap">Quali: {data.currentrace.qualidate}</span>
            <span class="text-nowrap">Race: {data.currentrace.racedate}</span>
          </div>
          <div class="card mt-2 bg-tertiary-400 p-2 shadow">
            <span class="text-nowrap font-bold">Track Layout:</span>
            <LazyImage
              src={data.currentrace.pictogram_url ?? "Invalid"}
              imgwidth={RACE_PICTOGRAM_WIDTH}
              imgheight={RACE_PICTOGRAM_HEIGHT}
              containerstyle="height: 150px; margin: auto;"
              imgstyle="background: transparent;"
            />
          </div>

          {#if currentpick}
            <div class="mt-2 flex gap-2">
              <div class="card w-full bg-tertiary-400 p-2 pb-0 shadow">
                <h1 class="mb-2 text-nowrap font-bold">Your P{data.currentrace.pxx} Pick:</h1>
                <LazyImage
                  src={driver(currentpick.pxx ?? "Invalid")?.headshot_url ??
                    get_by_value(data.graphics, "name", "driver_headshot_template")?.file_url ??
                    "Invalid"}
                  imgwidth={DRIVER_HEADSHOT_WIDTH}
                  imgheight={DRIVER_HEADSHOT_HEIGHT}
                  containerstyle="height: 150px; margin: auto;"
                  imgstyle="background: transparent;"
                />
              </div>
              <div class="card w-full bg-tertiary-400 p-2 pb-0 shadow">
                <h1 class="mb-2 text-nowrap font-bold">Your DNF Pick:</h1>
                <LazyImage
                  src={driver(currentpick.dnf ?? "Invalid")?.headshot_url ??
                    get_by_value(data.graphics, "name", "driver_headshot_template")?.file_url ??
                    "Invalid"}
                  imgwidth={DRIVER_HEADSHOT_WIDTH}
                  imgheight={DRIVER_HEADSHOT_HEIGHT}
                  containerstyle="height: 150px; margin: auto;"
                  imgstyle="background: transparent;"
                />
              </div>
            </div>
          {/if}

          <div class="mt-2 flex gap-2">
            <div class="card w-full bg-tertiary-400 p-2 shadow">
              <h1 class="text-nowrap font-bold">
                Picked ({pickedusers.length}/{data.currentpickedusers.length}):
              </h1>
              <div class="mt-1 grid grid-cols-4 gap-x-2 gap-y-0.5">
                {#each pickedusers.slice(0, 16) as user}
                  <LazyImage
                    src={user.avatar_url ??
                      get_by_value(data.graphics, "name", "driver_headshot_template")?.file_url ??
                      "Invalid"}
                    imgwidth={AVATAR_WIDTH}
                    imgheight={AVATAR_HEIGHT}
                    containerstyle="height: 35px; width: 35px;"
                    imgclass="shadow bg-transparent rounded-full"
                  />
                {/each}
              </div>
            </div>
            <div class="card w-full bg-tertiary-400 p-2 shadow">
              <h1 class="text-nowrap font-bold">
                Outstanding ({outstandingusers.length}/{data.currentpickedusers.length}):
              </h1>
              <div class="mt-1 grid grid-cols-4 gap-x-0 gap-y-0.5">
                {#each outstandingusers.slice(0, 16) as user}
                  <LazyImage
                    src={user.avatar_url ??
                      get_by_value(data.graphics, "name", "driver_headshot_template")?.file_url ??
                      "Invalid"}
                    imgwidth={AVATAR_WIDTH}
                    imgheight={AVATAR_HEIGHT}
                    containerstyle="height: 35px; width: 35px;"
                    imgclass="shadow bg-transparent rounded-full"
                  />
                {/each}
              </div>
            </div>
          </div>
        </div>
        <Button
          width="w-full"
          color="tertiary"
          extraclass="bg-tertiary-400 mt-2"
          onclick={create_guess_handler}
          style="height: 100%;"
          shadow
        >
          <span class="font-bold">{currentpick ? "Edit Picks" : "Make Picks"}</span>
        </Button>
      </svelte:fragment>
    </AccordionItem>
  </Accordion>
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
