<script lang="ts">
  import {
    Autocomplete,
    getModalStore,
    getToastStore,
    InputChip,
    type AutocompleteOption,
    type ModalStore,
    type ToastStore,
  } from "@skeletonlabs/skeleton";
  import { Button, Card, Dropdown } from "$lib/components";
  import type { Driver, Race, RaceResult, Substitution } from "$lib/schema";
  import { get_by_value } from "$lib/database";
  import { race_dropdown_options } from "$lib/dropdown";
  import { pb } from "$lib/pocketbase";
  import { get_error_toast } from "$lib/toast";
  import type { PageData } from "../../../routes/data/raceresults/$types";

  interface RaceResultCardProps {
    /** Data passed from the page context */
    data: PageData;

    /** The [RaceResult] object used to prefill values. */
    result?: RaceResult;
  }

  let { data, result = undefined }: RaceResultCardProps = $props();

  const modalStore: ModalStore = getModalStore();
  if ($modalStore[0].meta) {
    const meta = $modalStore[0].meta;

    data = meta.data;
    result = meta.result;
  }

  const toastStore: ToastStore = getToastStore();

  // Await promises
  let races: Race[] | undefined = $state(undefined);
  data.races.then((r: Race[]) => (races = r));

  let drivers: Driver[] | undefined = $state(undefined);
  data.drivers.then((d: Driver[]) => (drivers = d));

  let substitutions: Substitution[] | undefined = $state(undefined);
  data.substitutions.then((s: Substitution[]) => (substitutions = s));

  // Constants
  const labelwidth: string = "70px";

  // Reactive state
  let required: boolean = $derived(!result);
  let disabled: boolean = $derived(!data.admin); // TODO: Datelock (prevent entering future result)
  let race_select_value: string = $state(result?.race ?? "");

  let currentrace: Race | undefined = $derived(
    get_by_value<Race>(races ?? [], "id", race_select_value) ?? undefined,
  );

  let pxxs_placeholder: string = $derived(
    currentrace
      ? `Select P${(currentrace.pxx ?? -10) - 3} to P${(currentrace.pxx ?? -10) + 3}...`
      : `Select race first...`,
  );

  let pxxs_input: string = $state("");
  let pxxs_chips: string[] = $state([]);

  let dnfs_input: string = $state("");
  let dnfs_chips: string[] = $state([]);

  // Set the pxxs/dnfs states once the drivers are loaded
  data.drivers.then(async (drivers: Driver[]) => {
    pxxs_chips =
      result?.pxxs.map((id: string) => get_by_value(drivers, "id", id)?.code ?? "Invalid") ?? [];

    dnfs_chips =
      result?.dnfs.map((id: string) => get_by_value(drivers, "id", id)?.code ?? "Invalid") ?? [];
  });

  // This is the actual data that gets sent through the form
  let pxxs_ids: string[] = $state(result?.pxxs ?? []);
  let dnfs_ids: string[] = $state(result?.dnfs ?? []);

  let pxxs_options: AutocompleteOption<string>[] = $derived.by(() => {
    if (!race_select_value) return [];

    let active_and_substitutes: Driver[] = (drivers ?? []).filter(
      (driver: Driver) => driver.active,
    );

    (substitutions ?? [])
      .filter((substitution: Substitution) => substitution.race === race_select_value)
      .forEach((substitution: Substitution) => {
        const for_index = active_and_substitutes.findIndex(
          (driver: Driver) => driver.id === substitution.for,
        );
        const sub_index = (drivers ?? []).findIndex(
          (driver: Driver) => driver.id === substitution.substitute,
        );

        active_and_substitutes[for_index] = (drivers ?? [])[sub_index];
      });

    return active_and_substitutes.map((driver: Driver) => {
      return {
        // NOTE: Because Skeleton displays the values inside the autocomplete input,
        //       we have to supply the driver code twice and manage a list of ids manually (ugh)
        label: driver.code,
        value: driver.code,
      };
    });
  });

  let pxxs_whitelist: string[] = $derived.by(() =>
    (drivers ?? []).map((driver: Driver) => {
      return driver.code;
    }),
  );

  // Event handlers
  const on_pxxs_chip_select = (event: CustomEvent<AutocompleteOption<string>>): void => {
    if (disabled || !currentrace || !drivers) return;

    // Can only select 7 drivers
    if (pxxs_chips.length >= 7) return;

    // Can only select a driver once
    if (pxxs_chips.includes(event.detail.value)) return;

    // Manage labels that are displayed
    pxxs_chips.push(event.detail.value);
    pxxs_input = "";

    // Manage ids that are submitted via form
    const id: string = get_by_value(drivers, "code", event.detail.value)?.id ?? "Invalid";
    if (!pxxs_ids.includes(id)) {
      pxxs_ids.push(id);
    }
  };

  const on_pxxs_chip_remove = (event: CustomEvent): void => {
    pxxs_ids.splice(event.detail.chipIndex, 1);
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

  // Database actions
  const update_raceresult = (create?: boolean): (() => Promise<void>) => {
    const handler = async (): Promise<void> => {
      if (!race_select_value || race_select_value === "") {
        toastStore.trigger(get_error_toast("Please select a race!"));
        return;
      }
      if (!pxxs_ids || pxxs_ids.length !== 7) {
        toastStore.trigger(get_error_toast("Please select all 7 driver placements!"));
        return;
      }

      const raceresult_data = {
        race: race_select_value,
        pxxs: pxxs_ids,
        dnfs: dnfs_ids,
      };

      try {
        if (create) {
          await pb.collection("raceresults").create(raceresult_data);
        } else {
          if (!result?.id) {
            toastStore.trigger(get_error_toast("Invalid result id!"));
            return;
          }

          await pb.collection("raceresults").update(result.id, raceresult_data);
        }
        modalStore.close();
      } catch (error) {
        toastStore.trigger(get_error_toast("" + error));
      }
    };

    return handler;
  };

  const delete_raceresult = async (): Promise<void> => {
    if (!result?.id) {
      toastStore.trigger(get_error_toast("Invalid result id!"));
      return;
    }

    try {
      await pb.collection("raceresults").delete(result.id);
      modalStore.close();
    } catch (error) {
      toastStore.trigger(get_error_toast("" + error));
    }
  };
</script>

<Card width="w-full sm:w-[512px]">
  <div class="flex flex-col gap-2">
    <!-- Race select input -->
    {#await data.races then races}
      <Dropdown
        name="race"
        bind:value={race_select_value}
        options={race_dropdown_options(races)}
        {labelwidth}
        {disabled}
        {required}
      >
        Race
      </Dropdown>
    {/await}

    {#if race_select_value}
      <!-- PXXs autocomplete chips -->
      <InputChip
        bind:input={pxxs_input}
        bind:value={pxxs_chips}
        whitelist={pxxs_whitelist}
        allowUpperCase
        placeholder={pxxs_placeholder}
        name="pxxs_codes"
        {disabled}
        {required}
        on:remove={on_pxxs_chip_remove}
      />
      <div class="card max-h-48 w-full overflow-y-auto p-2" tabindex="-1">
        <Autocomplete
          bind:input={pxxs_input}
          options={pxxs_options}
          denylist={pxxs_chips}
          on:selection={on_pxxs_chip_select}
        />
      </div>

      <!-- DNFs autocomplete chips -->
      <InputChip
        bind:input={dnfs_input}
        bind:value={dnfs_chips}
        whitelist={pxxs_whitelist}
        allowUpperCase
        placeholder="Select DNFs..."
        name="dnfs_codes"
        {disabled}
        on:remove={on_dnfs_chip_remove}
      />
      <div class="card max-h-48 w-full overflow-y-auto p-2" tabindex="-1">
        <Autocomplete
          bind:input={dnfs_input}
          options={pxxs_options}
          denylist={dnfs_chips}
          on:selection={on_dnfs_chip_select}
        />
      </div>

      <!-- Save/Delete buttons -->
      <div class="flex items-center justify-end gap-2">
        {#if result}
          <Button onclick={update_raceresult()} color="secondary" {disabled} width="w-1/2"
            >Save</Button
          >
          <Button onclick={delete_raceresult} color="primary" {disabled} width="w-1/2"
            >Delete</Button
          >
        {:else}
          <Button onclick={update_raceresult(true)} color="tertiary" {disabled} width="w-full">
            Create Result
          </Button>
        {/if}
      </div>
    {/if}
  </div>
</Card>
