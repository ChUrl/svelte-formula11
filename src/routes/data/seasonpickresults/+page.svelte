<script lang="ts">
  import type { PageData } from "./$types";
  import { Button, Card, Dropdown, Input } from "$lib/components";
  import {
    get_by_value,
    get_driver_headshot_template,
    get_team_banner_template,
  } from "$lib/database";
  import {
    Autocomplete,
    Avatar,
    InputChip,
    SlideToggle,
    getToastStore,
    type AutocompleteOption,
    type ToastStore,
  } from "@skeletonlabs/skeleton";
  import { pb, pbUser } from "$lib/pocketbase";
  import type { Driver, SeasonPickResult, Team, User } from "$lib/schema";
  import {
    DRIVER_HEADSHOT_HEIGHT,
    DRIVER_HEADSHOT_WIDTH,
    TEAM_BANNER_HEIGHT,
    TEAM_BANNER_WIDTH,
  } from "$lib/config";
  import { driver_dropdown_options, team_dropdown_options } from "$lib/dropdown";
  import { get_error_toast } from "$lib/toast";

  let { data }: { data: PageData } = $props();

  const toastStore: ToastStore = getToastStore();

  let disabled: boolean = $derived(!$pbUser?.admin);
  const labelwidth: string = "150px";

  // Await promises
  let drivers: Driver[] | undefined = $state(undefined);
  data.drivers.then((d: Driver[]) => (drivers = d));

  let teams: Team[] | undefined = $state(undefined);
  data.teams.then((t: Team[]) => (teams = t));

  let seasonpickresult: SeasonPickResult | undefined = $state(undefined);
  data.seasonpickresults.then((r: SeasonPickResult[]) => {
    if (r.length === 1) {
      seasonpickresult = r[0];
    }
  });

  const active_drivers: Driver[] = $derived.by(() => {
    if (!drivers) return [];

    return drivers.filter((driver: Driver) => driver.active);
  });

  const hottake_correct: Record<string, boolean> = $state({});
  data.users.then((users: User[]) => {
    users.forEach((user: User) => {
      let contains_user = Object.entries(hottake_correct).some(
        ([userid, correct]: [string, boolean]) => userid === user.id,
      );
      if (!contains_user) {
        hottake_correct[user.id] = false;
      }
    });
  });
  data.seasonpickresults.then((results: SeasonPickResult[]) => {
    if (results.length === 0) {
      return;
    }

    const result: SeasonPickResult = results[0];

    result.correcthottake.forEach((userid: string) => {
      hottake_correct[userid] = true;
    });
  });

  let wdcwinner_select_value: string = $state("INVALID");
  let wccwinner_select_value: string = $state("INVALID");
  let doohan_starts: string = $state("INVALID");

  let overtakes_input: string = $state("");
  let overtakes_chips: string[] = $state([]);
  let dnfs_input: string = $state("");
  let dnfs_chips: string[] = $state([]);
  let teamwinners_input: string = $state("");
  let teamwinners_chips: string[] = $state([]);
  let podiums_input: string = $state("");
  let podiums_chips: string[] = $state([]);

  // Set all the results once it has loaded
  data.seasonpickresults.then((r: SeasonPickResult[]) => {
    if (r.length !== 1) {
      return;
    }

    const result = r[0];

    wdcwinner_select_value = result.wdcwinner;
    wccwinner_select_value = result.wccwinner;
    doohan_starts = result.doohanstarts.toString();
  });

  // Set the teamwinners/podiums states once the drivers are loaded
  Promise.all([data.drivers, data.seasonpickresults]).then(
    async ([drivers, results]: [Driver[], SeasonPickResult[]]) => {
      if (results.length !== 1) {
        return;
      }

      const result: SeasonPickResult = results[0];

      overtakes_chips =
        result?.mostovertakes.map(
          (id: string) => get_by_value(drivers, "id", id)?.code ?? "Invalid",
        ) ?? [];

      dnfs_chips =
        result?.mostdnfs.map((id: string) => get_by_value(drivers, "id", id)?.code ?? "Invalid") ??
        [];

      teamwinners_chips =
        result?.teamwinners.map(
          (id: string) => get_by_value(drivers, "id", id)?.code ?? "Invalid",
        ) ?? [];

      podiums_chips =
        result?.podiums.map((id: string) => get_by_value(drivers, "id", id)?.code ?? "Invalid") ??
        [];
    },
  );

  // This is the actual data that gets sent through the form
  let overtakes_ids: string[] = $derived.by(() => {
    return seasonpickresult?.mostovertakes ?? [];
  });
  let dnfs_ids: string[] = $derived.by(() => {
    return seasonpickresult?.mostdnfs ?? [];
  });
  let teamwinners_ids: string[] = $derived.by(() => {
    return seasonpickresult?.teamwinners ?? [];
  });
  let podiums_ids: string[] = $derived.by(() => {
    return seasonpickresult?.podiums ?? [];
  });

  let teamwinners_options: AutocompleteOption<string>[] = $derived.by(() =>
    (drivers ?? [])
      .filter((driver: Driver) => driver.active)
      .map((driver: Driver) => {
        const teamname: string = get_by_value(teams ?? [], "id", driver.team)?.name ?? "Invalid";

        return {
          firstname: driver.firstname,
          lastname: driver.lastname,
          code: driver.code,
          teamname: teamname,
        };
      })
      .sort((a, b) => a.teamname.localeCompare(b.teamname))
      .map((driver) => {
        return {
          label: `${driver.teamname}: ${driver.firstname} ${driver.lastname}`,
          value: driver.code,
        };
      }),
  );

  let teamwinners_whitelist: string[] = $derived.by(() =>
    (drivers ?? []).map((driver: Driver) => driver.code),
  );

  let teamwinners_denylist: string[] = $derived.by(() => {
    let denylist: string[] = [];

    teamwinners_chips
      .map((driver: string) => get_by_value(drivers ?? [], "code", driver))
      .forEach((driver: Driver | undefined) => {
        if (driver) {
          (drivers ?? [])
            .filter((d: Driver) => d.active)
            .filter((d: Driver) => d.team === driver.team)
            .forEach((d: Driver) => {
              denylist.push(d.code);
            });
        }
      });

    return denylist;
  });

  let podiums_options: AutocompleteOption<string>[] = $derived.by(() =>
    (drivers ?? [])
      .filter((driver: Driver) => driver.active) // TODO: This shouldn't be filtered but if I don't the whole page disappears?
      .sort((a: Driver, b: Driver) => a.firstname.localeCompare(b.firstname))
      .map((driver: Driver) => {
        return {
          label: `${driver.firstname} ${driver.lastname}`,
          value: driver.code,
        };
      }),
  );

  // Event handlers
  const on_overtakes_chip_select = (event: CustomEvent<AutocompleteOption<string>>): void => {
    if (disabled || !drivers) return;

    // Can only select a driver once
    if (overtakes_chips.includes(event.detail.value)) return;

    // Manage labels that are displayed
    overtakes_chips.push(event.detail.value);
    overtakes_input = "";

    // Manage ids that are submitted via form
    const id: string = get_by_value(drivers, "code", event.detail.value)?.id ?? "Invalid";
    if (!overtakes_ids.includes(id)) {
      overtakes_ids.push(id);
    }
  };

  const on_overtakes_chip_remove = (event: CustomEvent): void => {
    overtakes_ids.splice(event.detail.chipIndex, 1);
  };

  const on_dnfs_chip_select = (event: CustomEvent<AutocompleteOption<string>>): void => {
    if (disabled || !drivers) return;

    // Can only select a driver once
    if (dnfs_chips.includes(event.detail.value)) return;

    // Manage labels that are displayed
    dnfs_chips.push(event.detail.value);
    dnfs_input = "";

    // Manage ids that are submitted via form
    const id: string = get_by_value(drivers, "code", event.detail.value)?.id ?? "Invalid";
    if (!dnfs_ids.includes(id)) {
      dnfs_ids.push(id);
    }
  };

  const on_dnfs_chip_remove = (event: CustomEvent): void => {
    dnfs_ids.splice(event.detail.chipIndex, 1);
  };

  const on_teamwinners_chip_select = (event: CustomEvent<AutocompleteOption<string>>): void => {
    if (disabled || !drivers) return;

    // Can only select 10 drivers
    if (teamwinners_chips.length >= 10) return;

    // Can only select a driver once
    if (teamwinners_chips.includes(event.detail.value)) return;

    // Manage labels that are displayed
    teamwinners_chips.push(event.detail.value);
    teamwinners_input = "";

    // Manage ids that are submitted via form
    const id: string = get_by_value(drivers, "code", event.detail.value)?.id ?? "Invalid";
    if (!teamwinners_ids.includes(id)) {
      teamwinners_ids.push(id);
    }
  };

  const on_teamwinners_chip_remove = (event: CustomEvent): void => {
    teamwinners_ids.splice(event.detail.chipIndex, 1);
  };

  const on_podiums_chip_select = (event: CustomEvent<AutocompleteOption<string>>): void => {
    if (disabled || !drivers) return;

    // Can only select a driver once
    if (podiums_chips.includes(event.detail.value)) return;

    // Manage labels that are displayed
    podiums_chips.push(event.detail.value);
    podiums_input = "";

    // Manage ids that are submitted via form
    const id: string = get_by_value(drivers, "code", event.detail.value)?.id ?? "Invalid";
    if (!podiums_ids.includes(id)) {
      podiums_ids.push(id);
    }
  };

  const on_podiums_chip_remove = (event: CustomEvent): void => {
    podiums_ids.splice(event.detail.chipIndex, 1);
  };

  // Database actions
  const update_seasonpickresults = (create?: boolean): (() => Promise<void>) => {
    const handler = async (): Promise<void> => {
      if (!$pbUser?.id || $pbUser.id === "") {
        toastStore.trigger(get_error_toast("Invalid user id!"));
        return;
      }
      if (!wdcwinner_select_value || wdcwinner_select_value === "") {
        toastStore.trigger(get_error_toast("Please select a driver for WDC!"));
        return;
      }
      if (!wccwinner_select_value || wccwinner_select_value === "") {
        toastStore.trigger(get_error_toast("Please select a team for WCC!"));
        return;
      }
      if (!overtakes_ids || overtakes_ids.length === 0) {
        toastStore.trigger(get_error_toast("Please select a driver for most overtakes!"));
        return;
      }
      if (!dnfs_ids || dnfs_ids.length === 0) {
        toastStore.trigger(get_error_toast("Please select a driver for most DNFs!"));
        return;
      }
      if (
        !doohan_starts ||
        doohan_starts === "" ||
        parseInt(doohan_starts) <= 0 ||
        parseInt(doohan_starts) > 24
      ) {
        toastStore.trigger(
          get_error_toast("Please enter between 0 and 24 starts for Jack Doohan!"),
        );
        return;
      }
      if (!teamwinners_ids || teamwinners_ids.length !== 10) {
        toastStore.trigger(get_error_toast("Please select a winner for each team!"));
        return;
      }
      if (!podiums_ids || podiums_ids.length < 3) {
        toastStore.trigger(get_error_toast("Please select at least 3 drivers with podiums!"));
        return;
      }

      const seasonpickresults_data = {
        user: $pbUser.id,
        correcthottake: Object.entries(hottake_correct)
          .filter(([userid, correct]: [string, boolean]) => correct)
          .map(([userid, correct]: [string, boolean]) => userid),
        wdcwinner: wdcwinner_select_value,
        wccwinner: wccwinner_select_value,
        mostovertakes: overtakes_ids,
        mostdnfs: dnfs_ids,
        doohanstarts: doohan_starts,
        teamwinners: teamwinners_ids,
        podiums: podiums_ids,
      };

      try {
        if (create) {
          await pb.collection("seasonpickresults").create(seasonpickresults_data);
        } else {
          if (!seasonpickresult?.id) {
            toastStore.trigger(get_error_toast("Invalid seasonpickresult id!"));
            return;
          }
          await pb
            .collection("seasonpickresults")
            .update(seasonpickresult.id, seasonpickresults_data);
        }
      } catch (error) {
        toastStore.trigger(get_error_toast("" + error));
      }
    };

    return handler;
  };
</script>

<svelte:head>
  <title>Formula 11 - Season Pick Results</title>
</svelte:head>

<div class="pb-2">
  {#if seasonpickresult}
    <Button onclick={update_seasonpickresults()} width="w-full" color="tertiary" shadow {disabled}>
      <span class="font-bold">Update Season Pick Results</span>
    </Button>
  {:else}
    <Button
      onclick={update_seasonpickresults(true)}
      width="w-full"
      color="tertiary"
      shadow
      {disabled}
    >
      <span class="font-bold">Create Season Pick Results</span>
    </Button>
  {/if}
</div>
{#await Promise.all( [data.graphics, data.seasonpicks, data.users, data.seasonpickresults, data.drivers, data.teams], ) then [graphics, seasonpicks, users, seasonpickresults, drivers, teams]}
  <div class="grid grid-cols-1 gap-2 xl:grid-cols-2">
    <!-- WDC -->
    <Card
      imgsrc={get_by_value<Driver>(drivers, "id", wdcwinner_select_value)?.headshot_url ??
        get_driver_headshot_template(graphics)}
      imgid="wdcwinner_headshot"
      width="w-full h-24"
      imgwidth={DRIVER_HEADSHOT_WIDTH}
      imgheight={DRIVER_HEADSHOT_HEIGHT}
      imgleft={true}
      imgshadow={false}
      extraimgclass="mt-[11px]"
      extraclass="w-full"
    >
      <h1 class="mb-2 text-lg font-bold">Which driver fucking obliterated this season?</h1>
      <Dropdown
        bind:value={wdcwinner_select_value}
        options={driver_dropdown_options(active_drivers)}
        {labelwidth}
        {disabled}
        class="w-full"
        required
      >
        WDC Winner
      </Dropdown>
    </Card>

    <!-- WCC -->
    <Card
      imgsrc={get_by_value<Team>(teams, "id", wccwinner_select_value)?.banner_url ??
        get_team_banner_template(graphics)}
      imgid="wccwinner_banner"
      width="w-full h-24"
      imgwidth={TEAM_BANNER_WIDTH}
      imgheight={TEAM_BANNER_HEIGHT}
      imgleft={true}
      imgshadow={false}
      extraimgclass="mt-[10px] rounded-r-md"
      extraclass="w-full"
    >
      <h1 class="mb-2 text-lg font-bold">Which constructor constructed the best this season?</h1>
      <Dropdown
        bind:value={wccwinner_select_value}
        options={team_dropdown_options(teams)}
        {labelwidth}
        {disabled}
        class="w-full"
        required
      >
        WCC Winner
      </Dropdown>
    </Card>
  </div>

  <!-- Doohan Starts -->
  <div class="mt-2">
    <Card
      imgsrc={get_by_value<Driver>(drivers, "code", "DOO")?.headshot_url ??
        get_driver_headshot_template(graphics)}
      imgid="doohan_headshot"
      width="w-full h-24"
      imgwidth={DRIVER_HEADSHOT_WIDTH}
      imgheight={DRIVER_HEADSHOT_HEIGHT}
      imgleft={true}
      imgshadow={false}
      extraimgclass="mt-[11px]"
      extraclass="w-full"
    >
      <h1 class="mb-2 text-lg font-bold">How often did JACK DOOHAN start?</h1>
      <Input
        bind:value={doohan_starts}
        placeholder="JACK DOOHAN"
        type="number"
        required
        min="0"
        max="24"
        {labelwidth}
      >
        Doohan Starts
      </Input>
    </Card>
  </div>

  <!-- HOTTAKES -->
  <div class="mt-4 grid grid-cols-1 gap-2 xl:grid-cols-4">
    {#each seasonpicks as seasonpick}
      {@const user = get_by_value(users, "id", seasonpick.user)}
      <Card>
        <div class="flex h-20 gap-2">
          <div class="mt-2">
            <Avatar
              id="{user?.id ?? 'INVALID'}_avatar"
              src={user?.avatar_url}
              rounded="rounded-full"
              width="w-12 h-12"
              background="bg-primary-50"
            />
          </div>

          <div class="w-full">
            <h1 class="text-lg font-bold">{user?.username ?? "INVALID"}'s Hottake 💀</h1>
            <p>
              "{seasonpick.hottake}"
            </p>
          </div>

          <div class="flex flex-col gap-1">
            <p class="font-bold">Correct:</p>
            <SlideToggle
              name="correct"
              background="bg-primary-500"
              active="bg-tertiary-500"
              bind:checked={hottake_correct[user?.id ?? "INVALID"]}
              {disabled}
            />
          </div>
        </div>
      </Card>
    {/each}
  </div>

  <div class="mt-4 grid grid-cols-1 gap-2 xl:grid-cols-2">
    <!-- Overtakes chips -->
    <InputChip
      bind:input={overtakes_input}
      bind:value={overtakes_chips}
      whitelist={teamwinners_whitelist}
      allowUpperCase
      placeholder="Select Drivers with most Overtakes..."
      name="overtakes_codes"
      {disabled}
      required
      on:remove={on_overtakes_chip_remove}
    />

    <!-- Overtakes autocomplete options -->
    <div class="card max-h-48 w-full overflow-y-auto p-2" tabindex="-1">
      <Autocomplete
        bind:input={overtakes_input}
        options={podiums_options}
        denylist={overtakes_chips}
        on:selection={on_overtakes_chip_select}
      />
    </div>

    <!-- DNFs chips -->
    <InputChip
      bind:input={dnfs_input}
      bind:value={dnfs_chips}
      whitelist={teamwinners_whitelist}
      allowUpperCase
      placeholder="Select Drivers with most DNFs..."
      name="dnfs_codes"
      {disabled}
      required
      on:remove={on_dnfs_chip_remove}
    />

    <!-- DNFs autocomplete options -->
    <div class="card max-h-48 w-full overflow-y-auto p-2" tabindex="-1">
      <Autocomplete
        bind:input={dnfs_input}
        options={podiums_options}
        denylist={dnfs_chips}
        on:selection={on_dnfs_chip_select}
      />
    </div>

    <!-- Teamwinners chips -->
    <InputChip
      bind:input={teamwinners_input}
      bind:value={teamwinners_chips}
      whitelist={teamwinners_whitelist}
      allowUpperCase
      placeholder="Select Teamwinners..."
      name="teamwinners_codes"
      {disabled}
      required
      on:remove={on_teamwinners_chip_remove}
    />

    <!-- Teamwinners autocomplete options -->
    <div class="card max-h-48 w-full overflow-y-auto p-2" tabindex="-1">
      <Autocomplete
        bind:input={teamwinners_input}
        options={teamwinners_options}
        denylist={teamwinners_denylist}
        on:selection={on_teamwinners_chip_select}
      />
    </div>

    <!-- Podiums chips -->
    <InputChip
      bind:input={podiums_input}
      bind:value={podiums_chips}
      whitelist={teamwinners_whitelist}
      allowUpperCase
      placeholder="Select Drivers with Podiums..."
      name="podiums_codes"
      {disabled}
      required
      on:remove={on_podiums_chip_remove}
    />

    <!-- Podiums autocomplete options -->
    <div class="card max-h-48 w-full overflow-y-auto p-2" tabindex="-1">
      <Autocomplete
        bind:input={podiums_input}
        options={podiums_options}
        denylist={podiums_chips}
        on:selection={on_podiums_chip_select}
      />
    </div>
  </div>
{/await}
