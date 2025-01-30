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

  const race_popupsettings = (target: string): PopupSettings => {
    return {
      event: "click",
      target: target,
      placement: "right",
    };
  };

  // Define the background colors the picks will have depending on the raceresult
  const pxxcolors: string[] = [];
  pxxcolors[-1] = "auto";
  pxxcolors[0] = "#C2FBCC"; // 1 Point
  pxxcolors[6] = "#C2FBCC";
  pxxcolors[1] = "#6CDB7E"; // 3 Points
  pxxcolors[5] = "#6CDB7E";
  pxxcolors[2] = "#07B725"; // 6 Points
  pxxcolors[4] = "#07B725";
  pxxcolors[3] = "#EFBF04"; // 10 Points

  const dnfcolors: string[] = [];
  dnfcolors[-1] = "auto";
  dnfcolors[0] = "#EFBF04";
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
    <div class="mt-3 h-10 lg:mt-4">
      <div class="hidden h-5 text-sm font-bold lg:block">Points:</div>
      <div class="flex h-full flex-col lg:h-5 lg:flex-row lg:gap-2">
        <!-- Large Screens: -->
        <span
          class="hidden h-full w-full text-center align-middle text-sm rounded-container-token lg:block"
          style="background: {pxxcolors[3]}; line-height: 20px;"
        >
          10
        </span>
        <span
          class="hidden h-full w-full text-center align-middle text-sm rounded-container-token lg:block"
          style="background: {pxxcolors[4]}; line-height: 20px;"
        >
          6
        </span>
        <span
          class="hidden h-full w-full text-center align-middle text-sm rounded-container-token lg:block"
          style="background: {pxxcolors[5]}; line-height: 20px;"
        >
          3
        </span>
        <span
          class="hidden h-full w-full text-center align-middle text-sm rounded-container-token lg:block"
          style="background: {pxxcolors[6]}; line-height: 20px;"
        >
          1
        </span>

        <!-- Small Screens: -->
        <span
          class="block h-full w-full rounded-tl-lg rounded-tr-lg lg:hidden"
          style="background: {pxxcolors[3]};"
        ></span>
        <span class="block h-full w-full lg:hidden" style="background: {pxxcolors[4]};"></span>
        <span class="block h-full w-full lg:hidden" style="background: {pxxcolors[5]};"></span>
        <span
          class="block h-full w-full rounded-bl-lg rounded-br-lg lg:hidden"
          style="background: {pxxcolors[6]};"
        ></span>
      </div>
    </div>

    {#each data.raceresults as result}
      {@const race = getrace(result.race)}

      <div
        use:popup={race_popupsettings(race?.id ?? "Invalid")}
        class="card mt-1 flex h-20 w-7 flex-col bg-surface-300 p-2 shadow lg:mt-2 lg:w-36"
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
          {#each result.pxxs as pxx, index}
            {@const driver = getdriver(pxx)}
            <div class="flex gap-2">
              <span class="w-8">P{(race?.pxx ?? -100) - 3 + index}:</span>
              <span class="badge w-10 p-1" style="background: {pxxcolors[index]};">
                {driver?.code}
              </span>
            </div>
          {/each}

          {#if result.dnfs.length > 0}
            <hr class="border-black" style="border-style: inset;" />
          {/if}

          {#each result.dnfs as dnf}
            {@const driver = getdriver(dnf)}
            <div class="flex gap-2">
              <span class="w-8">DNF:</span>
              <span class="badge w-10 p-1" style="background: {dnfcolors[0]};">
                {driver?.code}
              </span>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <div class="hide-scrollbar flex w-full overflow-x-scroll pb-2">
    <!-- Not ideal but currentpickedusers contains all users, so we do not need to fetch the users separately -->
    {#each data.currentpickedusers as user}
      {@const picks = data.racepicks.filter((pick: RacePick) => pick.user === user.id)}

      <div
        class="card ml-1 mt-2 w-full p-1 shadow lg:ml-2 lg:p-2 {data.user &&
        data.user.username === user.username
          ? 'bg-primary-500'
          : ''}"
      >
        <!-- Avatar + name display at the top -->
        <div class="mx-auto flex h-10 w-fit">
          <LazyImage
            src={graphicfallback(user.avatar_url, "driver_headshot_template")}
            imgwidth={AVATAR_WIDTH}
            imgheight={AVATAR_HEIGHT}
            containerstyle="height: 40px; width: 40px;"
            imgclass="bg-surface-400 rounded-full"
          />
          <div
            style="height: 40px; line-height: 40px;"
            class="ml-2 hidden text-nowrap text-center align-middle lg:block"
          >
            {user.username}
          </div>
        </div>

        {#each data.raceresults as result}
          {@const race = getrace(result.race)}
          {@const pick = picks.filter((pick: RacePick) => pick.race === race?.id)[0]}
          {@const pxxcolor = pxxcolors[result.pxxs.indexOf(pick?.pxx ?? "Invalid")]}
          {@const dnfcolor =
            result.dnfs.indexOf(pick?.dnf ?? "Invalid") >= 0 ? dnfcolors[0] : dnfcolors[-1]}

          {#if pick}
            <div class="card mt-1 h-20 w-full bg-surface-300 p-1 lg:mt-2 lg:p-2">
              <div class="mx-auto flex h-full w-fit flex-col justify-evenly">
                <span
                  class="p-1 text-center text-sm rounded-container-token"
                  style="background: {pxxcolor};"
                >
                  {getdriver(pick?.pxx ?? "")?.code}
                </span>
                <span
                  class="p-1 text-center text-sm rounded-container-token"
                  style="background: {dnfcolor};"
                >
                  {getdriver(pick?.dnf ?? "")?.code}
                </span>
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
