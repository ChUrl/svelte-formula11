<script lang="ts">
  import { Card, Button, Dropdown, Input } from "$lib/components";
  import type { Driver, SeasonPick, Team } from "$lib/schema";
  import { get_by_value, get_driver_headshot_template } from "$lib/database";
  import {
    Autocomplete,
    getModalStore,
    getToastStore,
    InputChip,
    type AutocompleteOption,
    type ModalStore,
    type ToastStore,
  } from "@skeletonlabs/skeleton";
  import { DRIVER_HEADSHOT_HEIGHT, DRIVER_HEADSHOT_WIDTH } from "$lib/config";
  import { driver_dropdown_options, team_dropdown_options } from "$lib/dropdown";
  import { get_error_toast } from "$lib/toast";
  import { pb } from "$lib/pocketbase";
  import type { PageData } from "../../../routes/seasonpicks/$types";

  interface SeasonPickCardProps {
    /** Data passed from the page context */
    data: PageData;

    /** The [SeasonPick] object used to prefill values. */
    seasonpick?: SeasonPick;
  }

  let { data, seasonpick = undefined }: SeasonPickCardProps = $props();

  const modalStore: ModalStore = getModalStore();
  if ($modalStore[0].meta) {
    const meta = $modalStore[0].meta;

    data = meta.data;
    seasonpick = meta.seasonpick;
  }

  const toastStore: ToastStore = getToastStore();

  // Await promises
  let drivers: Driver[] | undefined = $state(undefined);
  data.drivers.then((d: Driver[]) => (drivers = d));

  let teams: Team[] | undefined = $state(undefined);
  data.teams.then((t: Team[]) => (teams = t));

  // Constants
  const labelwidth: string = "150px";

  // Reactive state
  let required: boolean = $derived(!seasonpick);
  let disabled: boolean = false; // TODO: Datelock
  let hottake_value: string = $state(seasonpick?.hottake ?? "");
  let wdc_value: string = $state(seasonpick?.wdcwinner ?? "");
  let wcc_value: string = $state(seasonpick?.wccwinner ?? "");
  let overtakes_value: string = $state(seasonpick?.mostovertakes ?? "");
  let dnfs_value: string = $state(seasonpick?.mostdnfs ?? "");
  let doohan_value: string = $state(seasonpick?.doohanstarts.toString() ?? "");

  let teamwinners_input: string = $state("");
  let teamwinners_chips: string[] = $state([]);

  let podiums_input: string = $state("");
  let podiums_chips: string[] = $state([]);

  // Set the teamwinners/podiums states once the drivers are loaded
  data.drivers.then(async (drivers: Driver[]) => {
    teamwinners_chips =
      seasonpick?.teamwinners.map(
        (id: string) => get_by_value(drivers, "id", id)?.code ?? "Invalid",
      ) ?? [];

    podiums_chips =
      seasonpick?.podiums.map((id: string) => get_by_value(drivers, "id", id)?.code ?? "Invalid") ??
      [];
  });

  // This is the actual data that gets sent through the form
  let teamwinners_ids: string[] = $state(seasonpick?.teamwinners ?? []);
  let podiums_ids: string[] = $state(seasonpick?.podiums ?? []);

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
      .filter((driver: Driver) => driver.active)
      .sort((a: Driver, b: Driver) => a.firstname.localeCompare(b.firstname))
      .map((driver: Driver) => {
        return {
          label: `${driver.firstname} ${driver.lastname}`,
          value: driver.code,
        };
      }),
  );

  // Event handlers
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
  const update_seasonpick = (create?: boolean): (() => Promise<void>) => {
    const handler = async (): Promise<void> => {
      if (!data.user?.id || data.user.id === "") {
        toastStore.trigger(get_error_toast("Invalid user id!"));
        return;
      }
      if (!hottake_value || hottake_value === "") {
        toastStore.trigger(get_error_toast("Please enter a hottake!"));
        return;
      }
      if (!wdc_value || wdc_value === "") {
        toastStore.trigger(get_error_toast("Please select a driver for WDC!"));
        return;
      }
      if (!wcc_value || wcc_value === "") {
        toastStore.trigger(get_error_toast("Please select a team for WCC!"));
        return;
      }
      if (!overtakes_value || overtakes_value === "") {
        toastStore.trigger(get_error_toast("Please select a driver for most overtakes!"));
        return;
      }
      if (!dnfs_value || dnfs_value === "") {
        toastStore.trigger(get_error_toast("Please select a driver for most DNFs!"));
        return;
      }
      if (
        !doohan_value ||
        doohan_value === "" ||
        parseInt(doohan_value) <= 0 ||
        parseInt(doohan_value) > 24
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

      const seasonpick_data = {
        user: data.user.id,
        hottake: hottake_value,
        wdcwinner: wdc_value,
        wccwinner: wcc_value,
        mostovertakes: overtakes_value,
        mostdnfs: dnfs_value,
        doohanstarts: doohan_value,
        teamwinners: teamwinners_ids,
        podiums: podiums_ids,
      };

      try {
        if (create) {
          await pb.collection("seasonpicks").create(seasonpick_data);
        } else {
          if (!seasonpick?.id) {
            toastStore.trigger(get_error_toast("Invalid seasonpick id!"));
            return;
          }
          await pb.collection("seasonpicks").update(seasonpick.id, seasonpick_data);
        }
        modalStore.close();
      } catch (error) {
        toastStore.trigger(get_error_toast("" + error));
      }
    };

    return handler;
  };

  const delete_seasonpick = async (): Promise<void> => {
    if (!seasonpick?.id) {
      toastStore.trigger(get_error_toast("Invalid seasonpick id!"));
      return;
    }

    try {
      await pb.collection("seasonpicks").delete(seasonpick.id);
      modalStore.close();
    } catch (error) {
      toastStore.trigger(get_error_toast("" + error));
    }
  };
</script>

{#await Promise.all([data.graphics, data.drivers, data.teams]) then [graphics, drivers, teams]}
  <Card width="w-full sm:w-[512px]">
    <div class="flex flex-col gap-2">
      <!-- Hottake -->
      <Input bind:value={hottake_value} {labelwidth} {disabled} {required}>Hottake</Input>

      <!-- WDC select -->
      <Dropdown
        bind:value={wdc_value}
        options={driver_dropdown_options(drivers.filter((driver: Driver) => driver.active))}
        {labelwidth}
        {disabled}
        {required}
      >
        WDC
      </Dropdown>

      <!-- WCC select -->
      <Dropdown
        bind:value={wcc_value}
        options={team_dropdown_options(teams)}
        {labelwidth}
        {disabled}
        {required}
      >
        WCC
      </Dropdown>

      <!-- Overtakes select -->
      <Dropdown
        bind:value={overtakes_value}
        options={driver_dropdown_options(drivers.filter((driver: Driver) => driver.active))}
        {labelwidth}
        {disabled}
        {required}
      >
        Most Overtakes
      </Dropdown>

      <!-- DNFs select -->
      <Dropdown
        bind:value={dnfs_value}
        options={driver_dropdown_options(drivers.filter((driver: Driver) => driver.active))}
        {labelwidth}
        {disabled}
        {required}
      >
        Most DNFs
      </Dropdown>

      <!-- Doohan Starts -->
      <Input
        type="number"
        min={0}
        max={24}
        bind:value={doohan_value}
        {labelwidth}
        {disabled}
        {required}
      >
        Doohan Starts
      </Input>

      <!-- Teamwinners autocomplete chips -->
      <InputChip
        bind:input={teamwinners_input}
        bind:value={teamwinners_chips}
        whitelist={teamwinners_whitelist}
        allowUpperCase
        placeholder="Select Teamwinners..."
        name="teamwinners_codes"
        {disabled}
        {required}
        on:remove={on_teamwinners_chip_remove}
      />
      <div class="card max-h-48 w-full overflow-y-auto p-2" tabindex="-1">
        <Autocomplete
          bind:input={teamwinners_input}
          options={teamwinners_options}
          denylist={teamwinners_denylist}
          on:selection={on_teamwinners_chip_select}
        />
      </div>

      <!-- Podiums autocomplete chips -->
      <InputChip
        bind:input={podiums_input}
        bind:value={podiums_chips}
        whitelist={teamwinners_whitelist}
        allowUpperCase
        placeholder="Select Drivers with Podiums..."
        name="podiums_codes"
        {disabled}
        {required}
        on:remove={on_podiums_chip_remove}
      />
      <div class="card max-h-48 w-full overflow-y-auto p-2" tabindex="-1">
        <Autocomplete
          bind:input={podiums_input}
          options={podiums_options}
          denylist={podiums_chips}
          on:selection={on_podiums_chip_select}
        />
      </div>

      <!-- Save/Delete buttons -->
      <div class="flex justify-end gap-2">
        {#if seasonpick}
          <Button onclick={update_seasonpick()} color="secondary" {disabled} width="w-1/2">
            Save Changes
          </Button>
          <Button onclick={delete_seasonpick} color="primary" {disabled} width="w-1/2">
            Delete
          </Button>
        {:else}
          <Button onclick={update_seasonpick(true)} color="tertiary" {disabled} width="w-full">
            Make Pick
          </Button>
        {/if}
      </div>
    </div>
  </Card>
{/await}
