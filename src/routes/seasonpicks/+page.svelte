<script lang="ts">
  import {
    Accordion,
    AccordionItem,
    getModalStore,
    type ModalSettings,
    type ModalStore,
  } from "@skeletonlabs/skeleton";
  import type { PageData } from "./$types";
  import type { Hottake, SeasonPick, SeasonPickedUser } from "$lib/schema";
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
{#await Promise.all([data.drivers, data.teams]) then [drivers, teams]}
  <Accordion class="card mx-auto bg-surface-500 shadow" regionPanel="pt-2" width="w-full">
    <AccordionItem>
      <svelte:fragment slot="lead"><ChequeredFlagIcon /></svelte:fragment>
      <svelte:fragment slot="summary">
        <span class="font-bold">Your Season Pick</span>
      </svelte:fragment>
      <svelte:fragment slot="content">
        <div class="justify-center gap-2 lg:flex">
          <!-- Only show the stuff if signed in -->
          {#if data.user}
            {@const teamwinners = data.seasonpick
              ? data.seasonpick.teamwinners.map((id: string) => get_by_value(drivers, "id", id))
              : [undefined]}
            {@const podiums = data.seasonpick
              ? data.seasonpick.podiums.map((id: string) => get_by_value(drivers, "id", id))
              : [undefined]}

            <!-- Hottake + Doohanstarts -->
            <div class="mt-2 flex gap-2">
              <div class="card w-full min-w-40 p-2 shadow">
                <h1 class="mb-2 text-nowrap font-bold">Hottake:</h1>
                <span class="text-sm">{data.seasonpick?.hottake}</span>
              </div>
              <div class="card w-full min-w-40 p-2 shadow">
                <h1 class="mb-2 text-nowrap font-bold">Doohan Starts:</h1>
                {#if data.seasonpick}
                  <span class="text-sm">
                    Jack Doohan startet {data.seasonpick?.doohanstarts} mal.
                  </span>
                {/if}
              </div>
            </div>

            <!-- WDC + WCC -->
            <div class="mt-2 flex gap-2">
              <div class="card w-full min-w-40 p-2 pb-0 shadow">
                <h1 class="mb-2 text-nowrap font-bold">WDC:</h1>
                <LazyImage
                  src={get_by_value(drivers, "id", data.seasonpick?.wdcwinner ?? "")
                    ?.headshot_url ?? get_driver_headshot_template(data.graphics)}
                  imgwidth={DRIVER_HEADSHOT_WIDTH}
                  imgheight={DRIVER_HEADSHOT_HEIGHT}
                  containerstyle="height: 115px; margin: auto;"
                  imgclass="bg-transparent cursor-pointer"
                  hoverzoom
                  onclick={seasonpick_handler}
                />
              </div>
              <div class="card w-full min-w-40 p-2 pb-0 shadow">
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
            </div>

            <!-- Overtakes + DNFs -->
            <div class="mt-2 flex gap-2">
              <div class="card w-full min-w-40 p-2 pb-0 shadow">
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
              <div class="card w-full min-w-40 p-2 pb-0 shadow">
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
            </div>

            <!-- Teamwinners + Podiums -->
            <div class="mt-2 flex gap-2">
              <div class="card max-h-[155px] w-full min-w-40 overflow-y-scroll p-2 shadow">
                <h1 class="mb-2 text-nowrap font-bold">Teamwinners:</h1>
                <div class="mt-1 grid grid-cols-4 gap-x-0 gap-y-0.5">
                  {#each teamwinners.slice(0, 12) as winner}
                    <LazyImage
                      src={winner?.headshot_url ?? get_driver_headshot_template(data.graphics)}
                      imgwidth={AVATAR_WIDTH}
                      imgheight={AVATAR_HEIGHT}
                      containerstyle="height: 35px; width: 35px;"
                      imgclass="bg-surface-400 rounded-full"
                    />
                  {/each}
                </div>
              </div>
              <div class="card max-h-[155px] w-full min-w-40 overflow-y-scroll p-2 shadow">
                <h1 class="mb-2 text-nowrap font-bold">Podiums:</h1>
                <div class="mt-1 grid grid-cols-4 gap-x-0 gap-y-0.5">
                  {#each podiums as podium}
                    <LazyImage
                      src={podium?.headshot_url ?? get_driver_headshot_template(data.graphics)}
                      imgwidth={AVATAR_WIDTH}
                      imgheight={AVATAR_HEIGHT}
                      containerstyle="height: 35px; width: 35px;"
                      imgclass="bg-surface-400 rounded-full"
                    />
                  {/each}
                </div>
              </div>
            </div>
          {/if}

          <!-- Show users that have and have not picked yet -->
          {#await Promise.all( [data.seasonpicks, data.seasonpickedusers, pickedusers, outstandingusers], ) then [seasonpicks, currentpicked, picked, outstanding]}
            {#if seasonpicks.length === 0}
              <div class="mt-2 flex gap-2">
                <div
                  class="card max-h-[155px] w-full min-w-40 overflow-y-scroll p-2 shadow lg:max-w-40"
                >
                  <h1 class="text-nowrap font-bold">
                    Picked ({picked.length}/{currentpicked.length}):
                  </h1>
                  <div class="mt-1 grid grid-cols-4 gap-x-0 gap-y-0.5">
                    {#each picked.slice(0, 16) as user}
                      <LazyImage
                        src={user.avatar_url ?? get_driver_headshot_template(data.graphics)}
                        imgwidth={AVATAR_WIDTH}
                        imgheight={AVATAR_HEIGHT}
                        containerstyle="height: 35px; width: 35px;"
                        imgclass="bg-surface-400 rounded-full"
                      />
                    {/each}
                  </div>
                </div>
                <div
                  class="card max-h-[155px] w-full min-w-40 overflow-y-scroll p-2 shadow lg:max-w-40"
                >
                  <h1 class="text-nowrap font-bold">
                    Missing ({outstanding.length}/{currentpicked.length}):
                  </h1>
                  <div class="mt-1 grid grid-cols-4 gap-x-0 gap-y-0.5">
                    {#each outstanding.slice(0, 16) as user}
                      <LazyImage
                        src={user.avatar_url ?? get_driver_headshot_template(data.graphics)}
                        imgwidth={AVATAR_WIDTH}
                        imgheight={AVATAR_HEIGHT}
                        containerstyle="height: 35px; width: 35px;"
                        imgclass="bg-surface-400 rounded-full"
                      />
                    {/each}
                  </div>
                </div>
              </div>
            {/if}
          {/await}
        </div>
      </svelte:fragment>
    </AccordionItem>
  </Accordion>
{/await}

<!-- The fookin table -->
<div class="flex">
  <div>
    <!-- TODO: Points popup? -->
    <div class="mt-4 h-10 w-7 lg:w-36"></div>

    <!-- Hottake -->
    <div class="card mt-2 flex h-20 w-7 flex-col !rounded-r-none bg-surface-300 p-2 shadow lg:w-36">
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
          <span class="hidden text-nowrap text-sm font-bold lg:block"
            >Constructors<br />Champion</span
          >
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
          class="card mt-2 flex h-[360px] w-7 flex-col !rounded-r-none bg-surface-300 p-2 shadow sm:h-[220px] md:h-[150px] lg:w-36"
        >
          <span class="hidden text-nowrap text-sm font-bold lg:block">Team-Battle<br />Winners</span
          >
          <span class="block rotate-90 text-nowrap text-xs font-bold lg:hidden">Teamwinners</span>
        </div>

        <!-- Podiums -->
        <div
          class="card mt-2 flex h-[360px] w-7 flex-col !rounded-r-none bg-surface-300 p-2 shadow md:h-[220px] lg:w-36 xl:h-[150px]"
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
        {@const teamwinners = pick
          ? pick.teamwinners.map((id: string) => get_by_value(drivers, "id", id))
          : [undefined]}
        {@const podiums = pick
          ? pick.podiums.map((id: string) => get_by_value(drivers, "id", id))
          : [undefined]}

        <div
          class="card ml-1 mt-2 w-full min-w-[9.5rem] overflow-hidden py-2 shadow lg:ml-2 {data.user &&
          data.user.username === user.username
            ? 'bg-primary-300'
            : ''}"
        >
          <!-- Avatar + name display at the top -->
          <div class="mx-auto flex h-10 w-fit">
            <LazyImage
              src={user.avatar_url ?? get_driver_headshot_template(data.graphics)}
              imgwidth={AVATAR_WIDTH}
              imgheight={AVATAR_HEIGHT}
              containerstyle="height: 40px; width: 40px;"
              imgclass="bg-surface-400 rounded-full"
            />
            <div
              style="height: 40px; line-height: 40px;"
              class="ml-2 hidden text-nowrap text-center align-middle lg:block"
            >
              <!-- TODO: Setting to toggle between username or firstname display -->
              {user.username}
            </div>
          </div>

          <!-- Hottake -->
          <div
            class="mt-2 h-20 w-full overflow-y-scroll border bg-surface-300 px-1 py-2 leading-3 lg:px-2"
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
            <!-- TODO: Sort teamwinners by team (and by code inside teams), so they are sorted equally for each column -->
            <div
              class="mt-2 h-[360px] w-full overflow-y-scroll border bg-surface-300 p-1 px-1 py-2 leading-3 sm:h-[220px] md:h-[150px] lg:px-2"
            >
              <div
                class="grid gap-2"
                style="grid-template-columns: repeat(auto-fill, minmax(62px, 1fr)); grid-template-rows: repeat(auto, 62px);"
              >
                {#each teamwinners as teamwinner}
                  <LazyImage
                    src={teamwinner?.headshot_url ?? get_driver_headshot_template(data.graphics)}
                    imgwidth={DRIVER_HEADSHOT_HEIGHT}
                    imgheight={DRIVER_HEADSHOT_WIDTH}
                    containerstyle="height: 62px;"
                    imgclass="bg-surface-400 rounded-md"
                  />
                {/each}
              </div>
            </div>

            <!-- Podiums -->
            <!-- TODO: Replace all style tags throughout the page with custom classes like height here -->
            <!-- TODO: Sort podiums by driver code, so they are sorted equally for each column -->
            <div
              class="mt-2 h-[360px] w-full overflow-y-scroll border bg-surface-300 p-1 px-1 py-2 leading-3 md:h-[220px] lg:px-2 xl:h-[150px]"
            >
              <div
                class="mx-auto grid gap-2"
                style="grid-template-columns: repeat(auto-fill, minmax(62px, 1fr));"
              >
                {#each podiums as podium}
                  <LazyImage
                    src={podium?.headshot_url ?? get_driver_headshot_template(data.graphics)}
                    imgwidth={DRIVER_HEADSHOT_HEIGHT}
                    imgheight={DRIVER_HEADSHOT_WIDTH}
                    containerstyle="height: 62px; width: 62px;"
                    imgclass="bg-surface-400 rounded-md"
                  />
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {/each}
    {/await}
  </div>
</div>
