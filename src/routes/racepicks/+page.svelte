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
  import type { CurrentPickedUser, RacePick } from "$lib/schema";
  import { get_by_value, get_driver_headshot_template } from "$lib/database";
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

  const modalStore: ModalStore = getModalStore();
  const create_guess_handler = async (event: Event) => {
    const modalSettings: ModalSettings = {
      type: "component",
      component: "racePickCard",
      meta: {
        racepick: currentpick,
        currentrace: data.currentrace,
        user: data.user,
        drivers: await data.drivers,
        disable_inputs: false, // TODO: Datelock
        headshot_template: get_driver_headshot_template(await data.graphics),
        pxx_select_value: pxx_select_value,
        dnf_select_value: dnf_select_value,
      },
    };

    modalStore.trigger(modalSettings);
  };

  const pickedusers = data.currentpickedusers.filter(
    (currentpickeduser: CurrentPickedUser) => currentpickeduser.picked,
  );
  const outstandingusers = data.currentpickedusers.filter(
    (currentpickeduser: CurrentPickedUser) => !currentpickeduser.picked,
  );

  const dateformat: string = "dd.MM' 'HH:mm";
  const formatdate = (date: string): string => format(new Date(date), dateformat);

  const race_popupsettings = (target: string): PopupSettings => {
    return {
      event: "click",
      target: target,
      placement: "right",
    };
  };
</script>

{#if data.currentrace}
  <Accordion class="card mx-auto bg-surface-500 shadow" regionPanel="pt-0" width="w-full">
    <AccordionItem>
      <svelte:fragment slot="lead"><ChequeredFlagIcon /></svelte:fragment>
      <svelte:fragment slot="summary">
        <span class="font-bold">Next Race Guess</span>
      </svelte:fragment>
      <svelte:fragment slot="content">
        <!-- Show information about the next race -->
        <div class="justify-center gap-2 lg:flex">
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
              <div class="m-auto flex">
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
                {#await data.graphics then graphics}
                  {#await data.drivers then drivers}
                    <LazyImage
                      src={get_by_value(drivers, "id", currentpick?.pxx ?? "")?.headshot_url ??
                        get_driver_headshot_template(graphics)}
                      imgwidth={DRIVER_HEADSHOT_WIDTH}
                      imgheight={DRIVER_HEADSHOT_HEIGHT}
                      containerstyle="height: 115px; margin: auto;"
                      imgclass="bg-transparent cursor-pointer"
                      hoverzoom
                      onclick={create_guess_handler}
                    />
                  {/await}
                {/await}
              </div>
              <div class="card w-full p-2 pb-0 shadow">
                <h1 class="mb-2 text-nowrap font-bold">Your DNF Pick:</h1>
                {#await data.graphics then graphics}
                  {#await data.drivers then drivers}
                    <LazyImage
                      src={get_by_value(drivers, "id", currentpick?.dnf ?? "")?.headshot_url ??
                        get_driver_headshot_template(graphics)}
                      imgwidth={DRIVER_HEADSHOT_WIDTH}
                      imgheight={DRIVER_HEADSHOT_HEIGHT}
                      containerstyle="height: 115px; margin: auto;"
                      imgclass="bg-transparent cursor-pointer"
                      hoverzoom
                      onclick={create_guess_handler}
                    />
                  {/await}
                {/await}
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
                {#await data.graphics then graphics}
                  {#each pickedusers.slice(0, 16) as user}
                    <LazyImage
                      src={user.avatar_url ?? get_driver_headshot_template(graphics)}
                      imgwidth={AVATAR_WIDTH}
                      imgheight={AVATAR_HEIGHT}
                      containerstyle="height: 35px; width: 35px;"
                      imgclass="bg-surface-400 rounded-full"
                    />
                  {/each}
                {/await}
              </div>
            </div>
            <div class="card w-full p-2 shadow">
              <h1 class="text-nowrap font-bold">
                Outstanding ({outstandingusers.length}/{data.currentpickedusers.length}):
              </h1>
              <div class="mt-1 grid grid-cols-4 gap-x-0 gap-y-0.5">
                {#await data.graphics then graphics}
                  {#each outstandingusers.slice(0, 16) as user}
                    <LazyImage
                      src={user.avatar_url ?? get_driver_headshot_template(graphics)}
                      imgwidth={AVATAR_WIDTH}
                      imgheight={AVATAR_HEIGHT}
                      containerstyle="height: 35px; width: 35px;"
                      imgclass="bg-surface-400 rounded-full"
                    />
                  {/each}
                {/await}
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
    <!-- Points color coding legend -->
    <!-- Use mt-3/mt-4 to account for 2x padding around the avatar. -->
    <div class="mt-4 h-10 w-7 lg:w-36">
      <div class="hidden h-5 text-sm font-bold lg:block">Points:</div>
      <div
        class="flex h-full flex-col overflow-hidden rounded-b-lg rounded-t-lg shadow lg:h-5 lg:flex-row lg:!rounded-l-lg lg:!rounded-r-lg lg:rounded-b-none lg:rounded-t-none"
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

    {#await data.races then races}
      {#each data.raceresults as result}
        {@const race = get_by_value(races, "id", result.race)}

        <div
          use:popup={race_popupsettings(race?.id ?? "Invalid")}
          class="card mt-2 flex h-20 w-7 flex-col !rounded-r-none bg-surface-300 p-2 shadow lg:w-36"
        >
          <span class="hidden text-sm font-bold lg:block">
            {race?.step}: {race?.name}
          </span>
          <span class="block rotate-90 text-sm font-bold lg:hidden">
            {race?.name.slice(0, 8)}{(race?.name.length ?? 8) > 8 ? "." : ""}
          </span>
          <span class="hidden text-sm lg:block">Date: {formatdate(race?.racedate ?? "")}</span>
          <span class="hidden text-sm lg:block">Guessed: P{race?.pxx}</span>
        </div>

        <!-- The race result popup is triggered on click on the race -->
        <div data-popup={race?.id ?? "Invalid"} class="card z-10 p-2 shadow">
          <span class="font-bold">Result:</span>
          <div class="mt-2 flex flex-col gap-1">
            {#await data.drivers then drivers}
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
            {/await}
          </div>
        </div>
      {/each}
    {/await}
  </div>

  <div class="hide-scrollbar flex w-full overflow-x-scroll pb-2">
    <!-- Not ideal but currentpickedusers contains all users, so we do not need to fetch the users separately -->
    {#each data.currentpickedusers as user}
      {@const picks = data.racepicks.filter((pick: RacePick) => pick.user === user.id)}

      <div
        class="card ml-1 mt-2 w-full overflow-hidden py-2 shadow lg:ml-2 {data.user &&
        data.user.username === user.username
          ? 'bg-primary-300'
          : ''}"
      >
        <!-- Avatar + name display at the top -->
        <div class="mx-auto flex h-10 w-fit">
          {#await data.graphics then graphics}
            <LazyImage
              src={user.avatar_url ?? get_driver_headshot_template(graphics)}
              imgwidth={AVATAR_WIDTH}
              imgheight={AVATAR_HEIGHT}
              containerstyle="height: 40px; width: 40px;"
              imgclass="bg-surface-400 rounded-full"
            />
          {/await}
          <div
            style="height: 40px; line-height: 40px;"
            class="ml-2 hidden text-nowrap text-center align-middle lg:block"
          >
            <!-- TODO: Setting to toggle between username or firstname display -->
            {user.username}
          </div>
        </div>

        {#await data.races then races}
          {#await data.drivers then drivers}
            {#each data.raceresults as result}
              {@const race = get_by_value(races, "id", result.race)}
              {@const pick = picks.filter((pick: RacePick) => pick.race === race?.id)[0]}
              {@const pxxcolor = PXX_COLORS[result.pxxs.indexOf(pick?.pxx ?? "Invalid")]}
              {@const dnfcolor =
                result.dnfs.indexOf(pick?.dnf ?? "Invalid") >= 0 ? PXX_COLORS[3] : PXX_COLORS[-1]}

              {#if pick}
                <div class="mt-2 h-20 w-full border bg-surface-300 p-1 lg:p-2">
                  <div class="mx-auto flex h-full w-fit flex-col justify-evenly">
                    <span
                      class="p-1 text-center text-sm rounded-container-token"
                      style="background: {pxxcolor};"
                    >
                      {get_by_value(drivers, "id", pick?.pxx ?? "")?.code}
                    </span>
                    <span
                      class="p-1 text-center text-sm rounded-container-token"
                      style="background: {dnfcolor};"
                    >
                      {get_by_value(drivers, "id", pick?.dnf ?? "")?.code}
                    </span>
                  </div>
                </div>
              {:else}
                <div class="mt-2 h-20 w-full"></div>
              {/if}
            {/each}
          {/await}
        {/await}
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
