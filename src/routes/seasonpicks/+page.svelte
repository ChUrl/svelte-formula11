<script lang="ts">
  import {
    Accordion,
    AccordionItem,
    getModalStore,
    type ModalSettings,
    type ModalStore,
  } from "@skeletonlabs/skeleton";
  import type { PageData } from "./$types";
  import type { Driver, Hottake, SeasonPick, SeasonPickedUser, User } from "$lib/schema";
  import { ChequeredFlagIcon, LazyImage } from "$lib/components";
  import {
    get_by_value,
    get_driver_headshot_template,
    get_team_banner_template,
  } from "$lib/database";
  import {
    AVATAR_HEIGHT,
    AVATAR_WIDTH,
    DRIVER_HEADSHOT_HEIGHT,
    DRIVER_HEADSHOT_WIDTH,
    TEAM_BANNER_HEIGHT,
    TEAM_BANNER_WIDTH,
  } from "$lib/config";
  import Countdown from "$lib/components/Countdown.svelte";
  import { pbUser } from "$lib/pocketbase";

  let { data }: { data: PageData } = $props();

  const modalStore: ModalStore = getModalStore();
  const seasonpick_handler = async (event: Event) => {
    const modalSettings: ModalSettings = {
      type: "component",
      component: "seasonPickCard",
      meta: {
        data,
        seasonpick: data.seasonpick,
      },
    };

    modalStore.trigger(modalSettings);
  };

  // Users that have already picked the season
  let pickedusers: Promise<SeasonPickedUser[]> = $derived.by(async () =>
    (await data.seasonpickedusers).filter(
      (seasonpickeduser: SeasonPickedUser) => seasonpickeduser.picked,
    ),
  );

  // Users that didn't already pick the season
  let outstandingusers: Promise<SeasonPickedUser[]> = $derived.by(async () =>
    (await data.seasonpickedusers).filter(
      (seasonpickeduser: SeasonPickedUser) => !seasonpickeduser.picked,
    ),
  );
</script>

<svelte:head>
  <title>Formula 11 - Season Picks</title>
</svelte:head>

<!-- Await this here so the accordion doesn't lag when opening -->
<!-- Only show the stuff if signed in -->
{#if $pbUser}
  {#await Promise.all( [data.drivers, data.teams, data.seasonpickedusers, pickedusers, outstandingusers], ) then [drivers, teams, currentpicked, picked, outstanding]}
    {@const teamwinners = data.seasonpick
      ? data.seasonpick.teamwinners
          .map((id: string) => get_by_value(drivers, "id", id) as Driver)
          .sort((a: Driver, b: Driver) => a.team.localeCompare(b.team))
      : undefined}
    {@const podiums = data.seasonpick
      ? data.seasonpick.podiums
          .map((id: string) => get_by_value(drivers, "id", id) as Driver)
          .sort((a: Driver, b: Driver) => a.code.localeCompare(b.code))
          .sort((a: Driver, b: Driver) => a.team.localeCompare(b.team))
      : undefined}

    <Accordion class="card mx-auto bg-surface-500 shadow" regionPanel="pt-2" width="w-full">
      <AccordionItem>
        <svelte:fragment slot="lead"><ChequeredFlagIcon /></svelte:fragment>
        <svelte:fragment slot="summary">
          <span class="font-bold">Your Season Pick</span>
        </svelte:fragment>
        <svelte:fragment slot="content">
          <div class="grid grid-cols-2 gap-2 lg:mx-auto lg:w-fit lg:grid-cols-5 2xl:grid-cols-10">
            <!-- Hottake -->
            <div class="card w-full min-w-40 p-2 shadow lg:max-w-40">
              <h1 class="mb-2 text-nowrap font-bold">Hottake:</h1>
              <span class="text-sm">{data.seasonpick?.hottake}</span>
            </div>

            <!-- Doohanstarts -->
            <div class="card w-full min-w-40 p-2 shadow lg:max-w-40">
              <h1 class="mb-2 text-nowrap font-bold">Doohan Starts:</h1>
              {#if data.seasonpick}
                <span class="text-sm">
                  Jack Doohan startet {data.seasonpick?.doohanstarts} mal.
                </span>
              {/if}
            </div>

            <!-- WDC -->
            <div class="card w-full min-w-40 p-2 pb-0 shadow lg:max-w-40">
              <h1 class="mb-2 text-nowrap font-bold">WDC:</h1>
              <LazyImage
                src={get_by_value(drivers, "id", data.seasonpick?.wdcwinner ?? "")?.headshot_url ??
                  get_driver_headshot_template(data.graphics)}
                imgwidth={DRIVER_HEADSHOT_WIDTH}
                imgheight={DRIVER_HEADSHOT_HEIGHT}
                containerstyle="height: 115px; margin: auto;"
                imgclass="bg-transparent cursor-pointer"
                hoverzoom
                onclick={seasonpick_handler}
              />
            </div>

            <!-- WDC -->
            <div class="card w-full min-w-40 p-2 pb-0 shadow lg:max-w-40">
              <h1 class="mb-2 text-nowrap font-bold">WCC:</h1>
              <LazyImage
                src={get_by_value(teams, "id", data.seasonpick?.wccwinner ?? "")?.banner_url ??
                  get_team_banner_template(data.graphics)}
                imgwidth={TEAM_BANNER_WIDTH}
                imgheight={TEAM_BANNER_HEIGHT}
                containerstyle="height: 80px; margin: auto;"
                imgclass="bg-transparent cursor-pointer rounded-md"
                hoverzoom
                onclick={seasonpick_handler}
              />
            </div>

            <!-- Overtakes -->
            <div class="card w-full min-w-40 p-2 pb-0 shadow lg:max-w-40">
              <h1 class="mb-2 text-nowrap font-bold">Most Overtakes:</h1>
              <LazyImage
                src={get_by_value(drivers, "id", data.seasonpick?.mostovertakes ?? "")
                  ?.headshot_url ?? get_driver_headshot_template(data.graphics)}
                imgwidth={DRIVER_HEADSHOT_WIDTH}
                imgheight={DRIVER_HEADSHOT_HEIGHT}
                containerstyle="height: 115px; margin: auto;"
                imgclass="bg-transparent cursor-pointer"
                hoverzoom
                onclick={seasonpick_handler}
              />
            </div>

            <!-- DNFs -->
            <div class="card w-full min-w-40 p-2 pb-0 shadow lg:max-w-40">
              <h1 class="mb-2 text-nowrap font-bold">Most DNFs:</h1>
              <LazyImage
                src={get_by_value(drivers, "id", data.seasonpick?.mostdnfs ?? "")?.headshot_url ??
                  get_driver_headshot_template(data.graphics)}
                imgwidth={DRIVER_HEADSHOT_WIDTH}
                imgheight={DRIVER_HEADSHOT_HEIGHT}
                containerstyle="height: 115px; margin: auto;"
                imgclass="bg-transparent cursor-pointer"
                hoverzoom
                onclick={seasonpick_handler}
              />
            </div>

            <!-- Teamwinners -->
            <div class="card max-h-[155px] w-full min-w-40 p-2 shadow lg:max-w-40">
              <h1 class="text-nowrap font-bold">Teamwinners:</h1>
              <div class="mt-1 grid max-h-[110px] grid-cols-4 gap-x-0 gap-y-0.5 overflow-y-scroll">
                {#if teamwinners}
                  {#each teamwinners as winner}
                    <LazyImage
                      src={winner.headshot_url ?? get_driver_headshot_template(data.graphics)}
                      imgwidth={AVATAR_WIDTH}
                      imgheight={AVATAR_HEIGHT}
                      containerstyle="height: 35px; width: 35px;"
                      imgclass="bg-surface-400 rounded-full"
                      tooltip={winner ? `${winner.firstname} ${winner.lastname}` : undefined}
                    />
                  {/each}
                {/if}
              </div>
            </div>

            <!-- Podiums -->
            <div class="card max-h-[155px] w-full min-w-40 p-2 shadow lg:max-w-40">
              <h1 class="text-nowrap font-bold">Podiums:</h1>
              <div class="mt-1 grid max-h-[110px] grid-cols-4 gap-x-0 gap-y-0.5 overflow-y-scroll">
                {#if podiums}
                  {#each podiums as podium}
                    <LazyImage
                      src={podium.headshot_url ?? get_driver_headshot_template(data.graphics)}
                      imgwidth={AVATAR_WIDTH}
                      imgheight={AVATAR_HEIGHT}
                      containerstyle="height: 35px; width: 35px;"
                      imgclass="bg-surface-400 rounded-full"
                      tooltip={podium ? `${podium.firstname} ${podium.lastname}` : undefined}
                    />
                  {/each}
                {/if}
              </div>
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
<div class="{!$pbUser ? 'mt-[-8px]' : ''} flex">
  <div>
    <!-- TODO: Points popup? -->
    <div class="mt-4 h-10 w-7 lg:w-36"></div>

    <!-- Hottake -->
    <div class="card mt-2 flex h-32 w-7 flex-col !rounded-r-none bg-surface-300 p-2 shadow lg:w-36">
      <span class="hidden text-nowrap text-sm font-bold lg:block">Hottake</span>
      <span class="block rotate-90 text-nowrap text-xs font-bold lg:hidden">Hottake</span>
    </div>

    {#await data.seasonpicks then seasonpicks}
      {#if seasonpicks.length > 0}
        <!-- Drivers Champion -->
        <div
          class="card mt-2 flex h-20 w-7 flex-col !rounded-r-none bg-surface-300 p-2 shadow lg:w-36"
        >
          <span class="hidden text-nowrap text-sm font-bold lg:block">Drivers<br />Champion</span>
          <span class="block rotate-90 text-nowrap text-xs font-bold lg:hidden">WDC</span>
        </div>

        <!-- Constructors Champion -->
        <div
          class="card mt-2 flex h-20 w-7 flex-col !rounded-r-none bg-surface-300 p-2 shadow lg:w-36"
        >
          <span class="hidden text-nowrap text-sm font-bold lg:block">
            Constructors<br />Champion
          </span>
          <span class="block rotate-90 text-nowrap text-xs font-bold lg:hidden">WCC</span>
        </div>

        <!-- Overtakes -->
        <div
          class="card mt-2 flex h-20 w-7 flex-col !rounded-r-none bg-surface-300 p-2 shadow lg:w-36"
        >
          <span class="hidden text-nowrap text-sm font-bold lg:block">Most Overtakes</span>
          <span class="block rotate-90 text-nowrap text-xs font-bold lg:hidden">Overtakes</span>
        </div>

        <!-- DNFs -->
        <div
          class="card mt-2 flex h-20 w-7 flex-col !rounded-r-none bg-surface-300 p-2 shadow lg:w-36"
        >
          <span class="hidden text-nowrap text-sm font-bold lg:block">Most DNFs</span>
          <span class="block rotate-90 text-nowrap text-xs font-bold lg:hidden">DNFs</span>
        </div>

        <!-- Doohan Starts -->
        <div
          class="card mt-2 flex h-20 w-7 flex-col !rounded-r-none bg-surface-300 p-2 shadow lg:w-36"
        >
          <span class="hidden text-nowrap text-sm font-bold lg:block">Doohan Starts</span>
          <span class="block rotate-90 text-nowrap text-xs font-bold lg:hidden">Doohan</span>
        </div>

        <!-- Teamwinners -->
        <div
          class="card mt-2 flex h-64 w-7 flex-col !rounded-r-none bg-surface-300 p-2 shadow lg:w-36"
        >
          <span class="hidden text-nowrap text-sm font-bold lg:block">Team-Battle<br />Winners</span
          >
          <span class="block rotate-90 text-nowrap text-xs font-bold lg:hidden">Teamwinners</span>
        </div>

        <!-- Podiums -->
        <div
          class="card mt-2 flex h-64 w-7 flex-col !rounded-r-none bg-surface-300 p-2 shadow lg:w-36"
        >
          <span class="hidden text-nowrap text-sm font-bold lg:block">Podiums</span>
          <span class="block rotate-90 text-nowrap text-xs font-bold lg:hidden">Podiums</span>
        </div>
      {/if}
    {/await}
  </div>

  <!-- TODO: Add user option to display driver codes instead of headshots (or both) -->
  <div class="flex w-full overflow-x-scroll pb-2">
    {#await Promise.all( [data.seasonpickedusers, data.seasonpicks, data.hottakes, data.drivers, data.teams], ) then [seasonpicked, seasonpicks, hottakes, drivers, teams]}
      {#each seasonpicked as user}
        {@const hottake = hottakes.filter((take: Hottake) => take.user === user.id)[0] ?? undefined}
        {@const pick =
          seasonpicks.filter((pick: SeasonPick) => pick.user === user.id)[0] ?? undefined}
        {@const wdcwinner = pick ? get_by_value(drivers, "id", pick.wdcwinner) : undefined}
        {@const wccwinner = pick ? get_by_value(teams, "id", pick.wccwinner) : undefined}
        {@const mostovertakes = pick ? get_by_value(drivers, "id", pick.mostovertakes) : undefined}
        {@const mostdnfs = pick ? get_by_value(drivers, "id", pick.mostdnfs) : undefined}
        {@const drivers_sorted = drivers
          .filter((driver: Driver) => driver.active)
          .sort((a: Driver, b: Driver) => a.code.localeCompare(b.code))
          .sort((a: Driver, b: Driver) => a.team.localeCompare(b.team))}

        <div
          class="card ml-1 mt-2 w-full min-w-36 overflow-hidden py-2 shadow lg:ml-2
          {$pbUser && $pbUser.username === user.username ? 'bg-primary-300' : ''}"
        >
          <!-- Avatar + name display at the top -->
          <div class="mx-auto flex h-10 w-fit">
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
              class="ml-2 hidden text-nowrap text-center align-middle lg:block"
            >
              <!-- TODO: Setting to toggle between username or firstname display -->
              {user.firstname}
            </div>
          </div>

          <!-- Hottake -->
          <div
            class="mt-2 h-32 w-full overflow-y-scroll border bg-surface-300 px-1 py-2 leading-3 lg:px-2"
          >
            <div class="mx-auto w-fit text-xs font-bold lg:text-sm">{hottake?.hottake ?? "?"}</div>
          </div>

          {#if seasonpicks.length > 0}
            <!-- Drivers Champion -->
            <div class="mt-2 h-20 w-full border bg-surface-300 px-1 py-2 leading-3 lg:px-2">
              <div class="mx-auto w-fit">
                <!-- NOTE: The containerstyle should be 64x64, don't know why that doesn't fit... (also below) -->
                <LazyImage
                  src={wdcwinner?.headshot_url ?? get_driver_headshot_template(data.graphics)}
                  imgwidth={DRIVER_HEADSHOT_HEIGHT}
                  imgheight={DRIVER_HEADSHOT_WIDTH}
                  containerstyle="height: 62px;"
                  imgclass="bg-surface-400 rounded-md"
                  tooltip={wdcwinner ? `${wdcwinner.firstname} ${wdcwinner.lastname}` : undefined}
                />
              </div>
            </div>

            <!-- Constructors Champion -->
            <div class="mt-2 h-20 w-full border bg-surface-300 p-1 px-1 py-2 leading-3 lg:px-2">
              <div class="mx-auto w-fit">
                <LazyImage
                  src={wccwinner?.banner_url ?? get_team_banner_template(data.graphics)}
                  imgwidth={TEAM_BANNER_WIDTH}
                  imgheight={TEAM_BANNER_HEIGHT}
                  containerstyle="height: 62px;"
                  imgclass="bg-surface-400 rounded-md"
                  tooltip={wccwinner?.name}
                />
              </div>
            </div>

            <!-- Most Overtakes -->
            <div class="mt-2 h-20 w-full border bg-surface-300 px-1 py-2 leading-3 lg:px-2">
              <div class="mx-auto w-fit">
                <LazyImage
                  src={mostovertakes?.headshot_url ?? get_driver_headshot_template(data.graphics)}
                  imgwidth={DRIVER_HEADSHOT_HEIGHT}
                  imgheight={DRIVER_HEADSHOT_WIDTH}
                  containerstyle="height: 62px;"
                  imgclass="bg-surface-400 rounded-md"
                  tooltip={mostovertakes
                    ? `${mostovertakes.firstname} ${mostovertakes.lastname}`
                    : undefined}
                />
              </div>
            </div>

            <!-- Most DNFs -->
            <div class="mt-2 h-20 w-full border bg-surface-300 px-1 py-2 leading-3 lg:px-2">
              <div class="mx-auto w-fit">
                <LazyImage
                  src={mostdnfs?.headshot_url ?? get_driver_headshot_template(data.graphics)}
                  imgwidth={DRIVER_HEADSHOT_HEIGHT}
                  imgheight={DRIVER_HEADSHOT_WIDTH}
                  containerstyle="height: 62px;"
                  imgclass="bg-surface-400 rounded-md"
                  tooltip={mostdnfs ? `${mostdnfs.firstname} ${mostdnfs.lastname}` : undefined}
                />
              </div>
            </div>

            <!-- Doohan Starts -->
            <div class="mt-2 h-20 w-full border bg-surface-300 p-1 px-1 py-2 leading-3 lg:px-2">
              <div class="mx-auto w-fit text-xs lg:text-sm">
                Jack Doohan startet <span class="font-bold">{pick?.doohanstarts ?? "?"}</span> mal.
              </div>
            </div>

            <!-- Teamwinners -->
            <div
              class="mt-2 h-64 w-full overflow-y-scroll border bg-surface-300 p-1 px-1 py-2 leading-3 lg:px-2"
            >
              {#if pick && pick.teamwinners}
                <div class="grid grid-cols-2 gap-1">
                  {#each drivers_sorted as driver}
                    {@const color: string = get_by_value(teams, "id", driver?.team ?? "")?.color ?? ""}
                    <div class="mx-auto w-fit text-xs lg:text-sm">
                      <div
                        class="flex gap-1"
                        style="opacity: {pick.teamwinners.includes(driver.id) ? 1.0 : 0.1};"
                      >
                        <span
                          class="badge h-5 w-5"
                          style="color: {color}; background-color: {color};"
                        >
                        </span>
                        <span class="w-7 align-middle" style="line-height: 20px;">
                          {driver?.code}
                        </span>
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>

            <!-- Podiums -->
            <!-- TODO: Replace all style tags throughout the page with custom classes like height here -->
            <div
              class="mt-2 h-64 w-full overflow-y-scroll border bg-surface-300 p-1 px-1 py-2 leading-3 lg:px-2"
            >
              {#if pick && pick.podiums}
                <div class="grid grid-cols-2 gap-1">
                  {#each drivers_sorted as driver}
                    {@const color: string = get_by_value(teams, "id", driver?.team ?? "")?.color ?? ""}
                    <div class="mx-auto w-fit text-xs lg:text-sm">
                      <div
                        class="flex gap-1"
                        style="opacity: {pick.podiums.includes(driver.id) ? 1.0 : 0.1};"
                      >
                        <span
                          class="badge h-5 w-5"
                          style="color: {color}; background-color: {color};"
                        >
                        </span>
                        <span class="w-7 align-middle" style="line-height: 20px;">
                          {driver?.code}
                        </span>
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    {/await}
  </div>
</div>

{#await Promise.all([data.seasonpicks, data.currentrace]) then [seasonpicks, currentrace]}
  {#if seasonpicks.length <= 0 && currentrace}
    <div class="card mx-auto w-fit p-2 shadow">
      <span class="mr-2 text-xl font-medium">Season pick modification will be locked in</span>
      <Countdown date={currentrace.qualidate} gotext="0d 0h 0m" extraclass="font-bold text-xl" />
      <span class="ml-2 text-xl font-medium">.</span>
    </div>
  {/if}
{/await}
