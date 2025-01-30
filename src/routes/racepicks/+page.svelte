<script lang="ts">
  import {
    Button,
    ChequeredFlagIcon,
    Countdown,
    LazyImage,
    StopwatchIcon,
    type DropdownOption,
  } from "$lib/components";
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
  import { format } from "date-fns";

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

  const getrace = (id: string): Race | undefined => get_by_value(data.races, "id", id);
  const getdriver = (id: string): Driver | undefined => get_by_value(data.drivers, "id", id);

  const pickedusers = data.currentpickedusers.filter(
    (currentpickeduser: CurrentPickedUser) => currentpickeduser.picked,
  );
  // pickedusers = pickedusers.concat(pickedusers, pickedusers);
  const outstandingusers = data.currentpickedusers.filter(
    (currentpickeduser: CurrentPickedUser) => !currentpickeduser.picked,
  );

  const dateformat: string = "dd.MM' 'HH:mm";
  const formatdate = (date: string): string => format(new Date(date), dateformat);

  const graphicfallback = (graphic: string | undefined, fallback: string): string =>
    graphic ?? get_by_value(data.graphics, "name", fallback)?.file_url ?? "Invalid";
</script>

{#if data.currentrace}
  <Accordion
    class="card mx-auto bg-surface-500 shadow"
    regionPanel="pt-0"
    width="w-full xl:w-[1090px]"
  >
    <AccordionItem>
      <svelte:fragment slot="lead"><ChequeredFlagIcon /></svelte:fragment>
      <svelte:fragment slot="summary">
        <span class="font-bold">Next Race Guess</span>
      </svelte:fragment>
      <svelte:fragment slot="content">
        <!-- Show information about the next race -->
        <div class="justify-center gap-2 xl:flex">
          <div class="mt-2 flex gap-2">
            <div class="card flex w-full flex-col p-2 shadow">
              <span class="font-bold">
                Step {data.currentrace.step}: {data.currentrace.name}
              </span>
              {#if data.currentrace.sprintdate}
                <div class="flex gap-2">
                  <span class="w-12">SQuali:</span>
                  <span>{formatdate(data.currentrace.sprintqualidate)}</span>
                </div>
                <div class="flex gap-2">
                  <span class="w-12">SRace:</span>
                  <span>{formatdate(data.currentrace.sprintdate)}</span>
                </div>
              {/if}
              <div class="flex gap-2">
                <span class="w-12">Quali:</span>
                <span>{formatdate(data.currentrace.qualidate)}</span>
              </div>
              <div class="flex gap-2">
                <span class="w-12">Race:</span>
                <span>{formatdate(data.currentrace.racedate)}</span>
              </div>
              <!-- TODO: Countdown to next sq/sr/q/race -->
              <div class="my-auto flex">
                <div class="mr-1 mt-1">
                  <StopwatchIcon />
                </div>
                <Countdown date={data.currentrace.racedate} extraclass="font-bold" />
              </div>
            </div>
            <div class="card w-full p-2 shadow">
              <span class="text-nowrap font-bold">Track Layout:</span>
              <LazyImage
                src={data.currentrace.pictogram_url ?? "Invalid"}
                imgwidth={RACE_PICTOGRAM_WIDTH}
                imgheight={RACE_PICTOGRAM_HEIGHT}
                containerstyle="height: 115px; margin: auto;"
                imgstyle="background: transparent;"
              />
            </div>
          </div>

          <!-- Only show the userguess if signed in -->
          {#if data.user}
            <div class="mt-2 flex gap-2">
              <div class="card w-full p-2 pb-0 shadow">
                <h1 class="mb-2 text-nowrap font-bold">Your P{data.currentrace.pxx} Pick:</h1>
                <LazyImage
                  src={graphicfallback(
                    getdriver(currentpick?.pxx ?? "")?.headshot_url,
                    "driver_headshot_template",
                  )}
                  imgwidth={DRIVER_HEADSHOT_WIDTH}
                  imgheight={DRIVER_HEADSHOT_HEIGHT}
                  containerstyle="height: 115px; margin: auto;"
                  imgclass="bg-transparent cursor-pointer"
                  hoverzoom
                  onclick={create_guess_handler}
                />
              </div>
              <div class="card w-full p-2 pb-0 shadow">
                <h1 class="mb-2 text-nowrap font-bold">Your DNF Pick:</h1>
                <LazyImage
                  src={graphicfallback(
                    getdriver(currentpick?.dnf ?? "")?.headshot_url,
                    "driver_headshot_template",
                  )}
                  imgwidth={DRIVER_HEADSHOT_WIDTH}
                  imgheight={DRIVER_HEADSHOT_HEIGHT}
                  containerstyle="height: 115px; margin: auto;"
                  imgclass="bg-transparent cursor-pointer"
                  hoverzoom
                  onclick={create_guess_handler}
                />
              </div>
            </div>
          {/if}

          <!-- Show users that have and have not picked yet -->
          <div class="mt-2 flex gap-2">
            <div class="card w-full p-2 shadow">
              <h1 class="text-nowrap font-bold">
                Picked ({pickedusers.length}/{data.currentpickedusers.length}):
              </h1>
              <div class="mt-1 grid grid-cols-4 gap-x-2 gap-y-0.5">
                {#each pickedusers.slice(0, 16) as user}
                  <LazyImage
                    src={graphicfallback(user.avatar_url, "driver_headshot_template")}
                    imgwidth={AVATAR_WIDTH}
                    imgheight={AVATAR_HEIGHT}
                    containerstyle="height: 35px; width: 35px;"
                    imgclass="bg-surface-400 rounded-full"
                  />
                {/each}
              </div>
            </div>
            <div class="card w-full p-2 shadow">
              <h1 class="text-nowrap font-bold">
                Outstanding ({outstandingusers.length}/{data.currentpickedusers.length}):
              </h1>
              <div class="mt-1 grid grid-cols-4 gap-x-0 gap-y-0.5">
                {#each outstandingusers.slice(0, 16) as user}
                  <LazyImage
                    src={graphicfallback(user.avatar_url, "driver_headshot_template")}
                    imgwidth={AVATAR_WIDTH}
                    imgheight={AVATAR_HEIGHT}
                    containerstyle="height: 35px; width: 35px;"
                    imgclass="bg-surface-400 rounded-full"
                  />
                {/each}
              </div>
            </div>
          </div>
        </div>
      </svelte:fragment>
    </AccordionItem>
  </Accordion>
{/if}

<!-- The fookin table -->
<div class="flex">
  <div>
    <!-- Make space for the avatars in the guess columns. -->
    <!-- Use mt-4 to account for 2x padding around the avatar. -->
    <div class="mt-3 h-10 lg:mt-4"></div>

    {#each data.raceresults as result}
      {@const race = getrace(result.race)}

      <div class="card mt-1 flex h-20 w-7 flex-col bg-surface-300 p-2 shadow lg:mt-2 lg:w-36">
        <span class="hidden text-sm font-bold lg:block">
          {race?.step}: {race?.name}
        </span>
        <span class="block rotate-90 text-sm font-bold lg:hidden">
          {race?.name.slice(0, 8)}{(race?.name.length ?? 8) > 8 ? "." : ""}
        </span>
        <span class="hidden text-sm lg:block">{race?.racedate}</span>
      </div>
    {/each}
  </div>

  <div class="hide-scrollbar flex w-full overflow-x-scroll pb-2">
    <!-- Not ideal but currentpickedusers contains all users, so we do not need to fetch the users separately -->
    {#each data.currentpickedusers as user}
      {@const picks = data.racepicks.filter((pick: RacePick) => pick.user === user.id)}

      <div class="card ml-1 mt-2 w-full p-1 shadow lg:ml-2 lg:p-2">
        <!-- Avatar + name display at the top -->
        <div class="mx-auto flex h-10 w-fit">
          <LazyImage
            src={graphicfallback(user.avatar_url, "driver_headshot_template")}
            imgwidth={AVATAR_WIDTH}
            imgheight={AVATAR_HEIGHT}
            containerstyle="height: 35px; width: 35px;"
            imgclass="bg-surface-400 rounded-full"
          />
          <div
            style="height: 35px; line-height: 35px;"
            class="ml-2 hidden text-nowrap text-center align-middle lg:block"
          >
            {user.username}
          </div>
        </div>

        {#each data.raceresults as result}
          {@const race = getrace(result.race)}
          {@const pick = picks.filter((pick: RacePick) => pick.race === race?.id)[0]}

          {#if pick}
            <div class="card mt-1 h-20 w-full bg-surface-300 p-1 lg:mt-2 lg:p-2">
              <div class="mx-auto flex h-full w-fit flex-col justify-center">
                <span class="text-sm">PXX: {getdriver(pick?.pxx ?? "")?.code}</span>
                <span class="text-sm">DNF: {getdriver(pick?.dnf ?? "")?.code}</span>
              </div>
            </div>
          {:else}
            <div class="mt-1 h-20 w-full lg:mt-2"></div>
          {/if}
        {/each}
      </div>
    {/each}
  </div>
</div>

<!-- "Table" of past guesses (not an actual table this time): -->
<!-- - Left column (rounded div column with race information: name, step, pxx) -->
<!--   - Show full result on-click? -->
<!-- - Rounded middle block (rest of width) with guesses: -->
<!--   - Just avatar at the top (reduce width) with points below, username on hover? -->
<!--   - Color-coded compact pxx + dnf picks (with podium + skull icons to differentiate?) -->

<!-- Make 2 variations (races as rows and races as columns) + settings toggle? -->
