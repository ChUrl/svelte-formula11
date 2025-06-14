<script lang="ts">
  import { ChequeredFlagIcon, Countdown, LazyImage, StopwatchIcon } from "$lib/components";
  import {
    Accordion,
    AccordionItem,
    getModalStore,
    popup,
    type ModalSettings,
    type ModalStore,
    type PopupSettings,
  } from "@skeletonlabs/skeleton";
  import type { PageData } from "./$types";
  import {
    AVATAR_HEIGHT,
    AVATAR_WIDTH,
    DRIVER_HEADSHOT_HEIGHT,
    DRIVER_HEADSHOT_WIDTH,
    PXX_COLORS,
    RACE_PICTOGRAM_HEIGHT,
    RACE_PICTOGRAM_WIDTH,
  } from "$lib/config";
  import { runes, substring } from "runes2";
  import { format_date, shortdatetimeformat } from "$lib/date";
  import type { CurrentPickedUser, RacePick } from "$lib/schema";
  import { get_by_value, get_driver_headshot_template } from "$lib/database";
  import { pbUser } from "$lib/pocketbase";

  let { data }: { data: PageData } = $props();

  const modalStore: ModalStore = getModalStore();
  const racepick_handler = async (event: Event) => {
    const modalSettings: ModalSettings = {
      type: "component",
      component: "racePickCard",
      meta: {
        data,
        racepick: data.racepick,
      },
    };

    modalStore.trigger(modalSettings);
  };

  // Users that have already picked the current race
  let pickedusers: Promise<CurrentPickedUser[]> = $derived.by(async () =>
    (await data.currentpickedusers).filter(
      (currentpickeduser: CurrentPickedUser) => currentpickeduser.picked,
    ),
  );

  // Users that didn't already pick the current race
  let outstandingusers: Promise<CurrentPickedUser[]> = $derived.by(async () =>
    (await data.currentpickedusers).filter(
      (currentpickeduser: CurrentPickedUser) => !currentpickeduser.picked,
    ),
  );

  const race_popupsettings = (target: string): PopupSettings => {
    return {
      event: "click",
      target: target,
      placement: "right-start",
    };
  };
</script>

<svelte:head>
  <title>Formula 11 - Race Picks</title>
</svelte:head>

<!-- Only show the userguess if signed in and we have a next race -->
{#if $pbUser && data.currentrace}
  {#await Promise.all( [data.drivers, data.currentpickedusers, pickedusers, outstandingusers], ) then [drivers, currentpicked, picked, outstanding]}
    <!-- HACK: relative was required to get the shadow to show up above the upper table occluder? -->
    <Accordion
      class="card relative z-20 mx-auto bg-surface-500 shadow"
      regionPanel="pt-0"
      width="w-full"
    >
      <AccordionItem>
        <svelte:fragment slot="lead"><ChequeredFlagIcon /></svelte:fragment>
        <svelte:fragment slot="summary">
          <span class="font-bold">Next Race Guess</span>
        </svelte:fragment>
        <svelte:fragment slot="content">
          <div class="grid grid-cols-2 gap-2 lg:mx-auto lg:w-fit lg:grid-cols-6">
            <!-- Show information about the next race -->
            <div class="card flex w-full min-w-40 flex-col p-2 shadow lg:max-w-40">
              <span class="font-bold">
                {data.currentrace.name}
              </span>
              {#if data.currentrace.sprintdate}
                <div class="flex gap-2">
                  <span class="w-12">SQuali:</span>
                  <span>{format_date(data.currentrace.sprintqualidate, shortdatetimeformat)}</span>
                </div>
                <div class="flex gap-2">
                  <span class="w-12">SRace:</span>
                  <span>{format_date(data.currentrace.sprintdate, shortdatetimeformat)}</span>
                </div>
              {/if}
              <div class="flex gap-2">
                <span class="w-12">Quali:</span>
                <span>{format_date(data.currentrace.qualidate, shortdatetimeformat)}</span>
              </div>
              <div class="flex gap-2">
                <span class="w-12">Race:</span>
                <span>{format_date(data.currentrace.racedate, shortdatetimeformat)}</span>
              </div>
              <div class="m-auto flex">
                <div class="mr-1 mt-1">
                  <StopwatchIcon />
                </div>
                <Countdown date={data.currentrace.racedate} extraclass="font-bold" />
              </div>
            </div>

            <!-- Show race pictogram -->
            <div class="card w-full min-w-40 p-2 shadow lg:max-w-40">
              <h1 class="mb-2 text-nowrap font-bold">Track Layout:</h1>
              <LazyImage
                src={data.currentrace.pictogram_url ?? "Invalid"}
                imgwidth={RACE_PICTOGRAM_WIDTH}
                imgheight={RACE_PICTOGRAM_HEIGHT}
                containerstyle="height: 105px; margin: auto;"
                imgstyle="background: transparent;"
              />
            </div>

            <!-- PXX pick -->
            <div class="card w-full min-w-40 p-2 pb-0 shadow lg:max-w-40">
              <h1 class="mb-2 text-nowrap font-bold">Your P{data.currentrace.pxx} Pick:</h1>
              <LazyImage
                src={get_by_value(drivers, "id", data.racepick?.pxx ?? "")?.headshot_url ??
                  get_driver_headshot_template(data.graphics)}
                imgwidth={DRIVER_HEADSHOT_WIDTH}
                imgheight={DRIVER_HEADSHOT_HEIGHT}
                containerstyle="height: 115px; margin: auto;"
                imgclass="bg-transparent cursor-pointer"
                hoverzoom
                onclick={racepick_handler}
              />
            </div>

            <!-- DNF pick -->
            <div class="card w-full min-w-40 p-2 pb-0 shadow lg:max-w-40">
              <h1 class="mb-2 text-nowrap font-bold">Your DNF Pick:</h1>
              <LazyImage
                src={get_by_value(drivers, "id", data.racepick?.dnf ?? "")?.headshot_url ??
                  get_driver_headshot_template(data.graphics)}
                imgwidth={DRIVER_HEADSHOT_WIDTH}
                imgheight={DRIVER_HEADSHOT_HEIGHT}
                containerstyle="height: 115px; margin: auto;"
                imgclass="bg-transparent cursor-pointer"
                hoverzoom
                onclick={racepick_handler}
              />
            </div>

            <!-- Show users that have picked -->
            <div class="card max-h-[155px] w-full min-w-40 p-2 shadow lg:max-w-40">
              <h1 class="text-nowrap font-bold">
                Picked ({picked.length}/{currentpicked.length}):
              </h1>
              <div class="mt-1 grid max-h-[110px] grid-cols-4 gap-x-0 gap-y-0.5 overflow-y-scroll">
                {#each picked as user}
                  <LazyImage
                    src={user.avatar_url ?? get_driver_headshot_template(data.graphics)}
                    imgwidth={AVATAR_WIDTH}
                    imgheight={AVATAR_HEIGHT}
                    containerstyle="height: 35px; width: 35px;"
                    imgclass="bg-surface-400 rounded-full"
                    tooltip={user.firstname}
                  />
                {/each}
              </div>
            </div>

            <!-- Show users that have not picked yet -->
            <div class="card max-h-[155px] w-full min-w-40 p-2 shadow lg:max-w-40">
              <h1 class="text-nowrap font-bold">
                Missing ({outstanding.length}/{currentpicked.length}):
              </h1>
              <div class="mt-1 grid max-h-[110px] grid-cols-4 gap-x-0 gap-y-0.5 overflow-y-scroll">
                {#each outstanding as user}
                  <LazyImage
                    src={user.avatar_url ?? get_driver_headshot_template(data.graphics)}
                    imgwidth={AVATAR_WIDTH}
                    imgheight={AVATAR_HEIGHT}
                    containerstyle="height: 35px; width: 35px;"
                    imgclass="bg-surface-400 rounded-full"
                    tooltip={user.firstname}
                  />
                {/each}
              </div>
            </div>
          </div>
        </svelte:fragment>
      </AccordionItem>
    </Accordion>
  {/await}
{/if}

<!-- The fookin table -->
<div
  class="{!$pbUser
    ? 'mt-[-8px]'
    : ''} relative h-[calc(100vh-200px)] w-[calc(100vw-16px)] scroll-pl-8 scroll-pt-[72px] flex-col overflow-scroll max-lg:hide-scrollbar lg:h-[calc(100vh-116px)] lg:scroll-pl-[152px]"
>
  <div class="sticky top-0 z-[15] flex w-full min-w-fit">
    <!-- Points color coding legend -->
    <!-- Use mt-3/mt-4 to account for 2x padding around the avatar. -->
    <div
      class="sticky left-0 z-20 h-16 w-7 min-w-7 max-w-7 bg-surface-50 pt-2 lg:w-36 lg:min-w-36 lg:max-w-36 lg:pt-4"
    >
      <div class="hidden h-5 text-sm font-bold lg:block">Points:</div>
      <div
        class="flex h-full flex-col overflow-hidden rounded-b-lg rounded-t-lg lg:h-5 lg:flex-row lg:!rounded-l-lg lg:!rounded-r-lg lg:rounded-b-none lg:rounded-t-none"
      >
        <!-- Large Screens: -->
        <span
          class="hidden h-full w-full text-center align-middle text-sm lg:block"
          style="background: {PXX_COLORS[3]}; line-height: 20px;"
        >
          10
        </span>
        <span
          class="hidden h-full w-full text-center align-middle text-sm lg:block"
          style="background: {PXX_COLORS[4]}; line-height: 20px;"
        >
          6
        </span>
        <span
          class="hidden h-full w-full text-center align-middle text-sm lg:block"
          style="background: {PXX_COLORS[5]}; line-height: 20px;"
        >
          3
        </span>
        <span
          class="hidden h-full w-full text-center align-middle text-sm lg:block"
          style="background: {PXX_COLORS[6]}; line-height: 20px;"
        >
          1
        </span>

        <!-- Small Screens: -->
        <span class="block h-full w-full lg:hidden" style="background: {PXX_COLORS[3]};"></span>
        <span class="block h-full w-full lg:hidden" style="background: {PXX_COLORS[4]};"></span>
        <span class="block h-full w-full lg:hidden" style="background: {PXX_COLORS[5]};"></span>
        <span class="block h-full w-full lg:hidden" style="background: {PXX_COLORS[6]};"></span>
      </div>
    </div>

    <!-- Avatars -->
    <div class="flex h-16 w-full bg-surface-50">
      {#await data.currentpickedusers then currentpicked}
        {#each currentpicked as user}
          <div
            class="card ml-1 mt-2 w-full min-w-14 rounded-b-none bg-surface-400 py-2
            {$pbUser && $pbUser.username === user.username ? '!bg-primary-400' : ''}"
          >
            <!-- Avatar + name display at the top -->
            <div class="m-auto flex h-10 w-fit">
              <LazyImage
                src={user.avatar_url ?? get_driver_headshot_template(data.graphics)}
                imgwidth={AVATAR_WIDTH}
                imgheight={AVATAR_HEIGHT}
                containerstyle="height: 40px; width: 40px;"
                imgclass="bg-surface-400 rounded-full"
                tooltip={user.firstname}
              />
              <div
                style="height: 40px; line-height: 40px;"
                class="ml-2 hidden text-nowrap text-center align-middle max-2xl:text-sm max-xl:text-xs lg:block"
              >
                {user.firstname}
              </div>
            </div>
          </div>
        {/each}
      {/await}
    </div>
  </div>

  <div class="flex w-full min-w-fit">
    <!-- Race name display -->
    <div
      class="sticky left-0 z-10 w-7 min-w-7 max-w-7 bg-surface-50 lg:w-36 lg:min-w-36 lg:max-w-36"
    >
      {#await Promise.all( [data.races, data.raceresults, data.drivers], ) then [races, raceresults, drivers]}
        {#each raceresults as result}
          {@const race = get_by_value(races, "id", result.race)}

          <div
            use:popup={race_popupsettings(race?.id ?? "Invalid")}
            class="card mt-1 flex h-16 w-7 cursor-pointer flex-col !rounded-r-none bg-surface-400 lg:h-20 lg:w-36 lg:p-2"
          >
            <!-- For large screens -->
            <span class="hidden text-sm font-bold lg:block">
              {race?.step}: {race?.name}
            </span>
            <span class="hidden text-sm lg:block">
              Date: {format_date(race?.racedate ?? "", shortdatetimeformat)}
            </span>
            <span class="hidden text-sm lg:block">Guessed: P{race?.pxx}</span>

            <!-- For small screens -->
            <!-- TODO: This requires the race name to end with an emoji, but this is never enforced -->
            <div class="mx-[2px] my-[18px] block text-lg font-bold lg:hidden">
              {runes(race?.name ?? "Invalid").at(-1)}
            </div>
          </div>

          <!-- The race result popup is triggered on click on the race -->
          <div data-popup={race?.id ?? "Invalid"} class="card z-50 bg-surface-400 p-2 shadow">
            <span class="font-bold">Result:</span>
            <div class="mt-2 flex flex-col gap-1">
              {#each result.pxxs as pxx, index}
                {@const driver = get_by_value(drivers, "id", pxx)}
                <div class="flex gap-2">
                  <span class="w-8">P{(race?.pxx ?? -100) - 3 + index}:</span>
                  <span class="badge w-10 p-1 text-center" style="background: {PXX_COLORS[index]};">
                    {driver?.code}
                  </span>
                </div>
              {/each}

              {#if result.dnfs.length > 0}
                <hr class="border-black" style="border-style: inset;" />
              {/if}

              {#each result.dnfs as dnf}
                {@const driver = get_by_value(drivers, "id", dnf)}
                <div class="flex gap-2">
                  <span class="w-8">DNF:</span>
                  <span class="badge w-10 p-1 text-center" style="background: {PXX_COLORS[3]};">
                    {driver?.code}
                  </span>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      {/await}
    </div>

    <!-- Picks -->
    <div class="flex w-full">
      <!-- Not ideal but currentpickedusers contains all users, so we do not need to fetch the users separately -->
      {#await Promise.all( [data.currentpickedusers, data.racepicks, data.races, data.drivers, data.raceresults], ) then [currentpicked, racepicks, races, drivers, raceresults]}
        {#each currentpicked as user}
          {@const picks = racepicks.filter((pick: RacePick) => pick.user === user.id)}

          <div class="ml-1 w-full min-w-14">
            {#each raceresults as result}
              {@const race = get_by_value(races, "id", result.race)}
              {@const pick = picks.filter((pick: RacePick) => pick.race === race?.id)[0]}
              {@const pxxcolor = PXX_COLORS[result.pxxs.indexOf(pick?.pxx ?? "Invalid")]}
              {@const dnfcolor =
                result.dnfs.indexOf(pick?.dnf ?? "Invalid") >= 0 ? PXX_COLORS[3] : PXX_COLORS[-1]}

              {#if pick}
                <div class="mt-1 h-16 w-full border bg-surface-200 px-1 py-2 lg:h-20 lg:px-2">
                  <div class="mx-auto flex h-full w-fit flex-col justify-evenly">
                    <span
                      class="w-10 p-1 text-center text-xs rounded-container-token lg:text-sm"
                      style="background: {pxxcolor};"
                    >
                      {get_by_value(drivers, "id", pick?.pxx ?? "")?.code}
                    </span>
                    <span
                      class="w-10 p-1 text-center text-xs rounded-container-token lg:text-sm"
                      style="background: {dnfcolor};"
                    >
                      {get_by_value(drivers, "id", pick?.dnf ?? "")?.code}
                    </span>
                  </div>
                </div>
              {:else}
                <div class="mt-1 h-16 w-full px-1 py-2 lg:h-20 lg:px-2"></div>
              {/if}
            {/each}
          </div>
        {/each}
      {/await}
    </div>
  </div>
</div>
