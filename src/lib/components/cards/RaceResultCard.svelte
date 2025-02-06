<script lang="ts">
  import {
    Autocomplete,
    getModalStore,
    InputChip,
    type AutocompleteOption,
    type ModalStore,
  } from "@skeletonlabs/skeleton";
  import { Button, Card, Dropdown } from "$lib/components";
  import type { Driver, Race, RaceResult, SkeletonData } from "$lib/schema";
  import { get_by_value } from "$lib/database";
  import { race_dropdown_options } from "$lib/dropdown";
  import { enhance } from "$app/forms";

  interface RaceResultCardProps {
    /** Data passed from the page context */
    data: SkeletonData & { results: RaceResult[] };

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

  let races: Race[] | undefined = $state(undefined);
  data.races.then((r: Race[]) => (races = r));

  let drivers: Driver[] | undefined = $state(undefined);
  data.drivers.then((d: Driver[]) => (drivers = d));

  // Constants
  const labelwidth: string = "70px";

  // Reactive state
  let required: boolean = $derived(!result);
  let disabled: boolean = $derived(!data.admin);
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
      result?.pxxs.map(
        (id: string, index: number) =>
          `P${(currentrace?.pxx ?? -10) + index - 3}: ${get_by_value(drivers, "id", id)?.code ?? "Invalid"}`,
      ) ?? [];

    dnfs_chips =
      result?.dnfs.map((id: string) => get_by_value(drivers, "id", id)?.code ?? "Invalid") ?? [];
  });

  // This is the actual data that gets sent through the form
  let pxxs_ids: string[] = $state(result?.pxxs ?? []);
  let dnfs_ids: string[] = $state(result?.dnfs ?? []);

  let pxxs_options: AutocompleteOption<string>[] = $derived.by(() =>
    (drivers ?? [])
      .filter((driver: Driver) => {
        // Filter out all drivers that are already selected
        return !pxxs_ids.includes(driver.id);
      })
      .map((driver: Driver) => {
        return {
          // NOTE: Because Skeleton displays the values inside the autocomplete input,
          //       we have to supply the driver code twice and manage a list of ids manually (ugh)
          label: driver.code,
          value: driver.code,
        };
      }),
  );

  let dnfs_options: AutocompleteOption<string>[] = $derived.by(() =>
    (drivers ?? []).map((driver: Driver) => {
      return {
        // NOTE: Because Skeleton displays the values inside the autocomplete input,
        //       we have to supply the driver code twice and manage a list of ids manually (ugh)
        label: driver.code,
        value: driver.code,
      };
    }),
  );

  let pxxs_whitelist: string[] = $derived.by(() =>
    (drivers ?? []).map((driver: Driver) => {
      return driver.code;
    }),
  );

  // Event handlers
  const on_race_select = (event: Event): void => {
    pxxs_chips = pxxs_chips.map(
      (label: string, index: number) =>
        `P${(currentrace?.pxx ?? -10) + index - 3}: ${label.split(" ").pop()}`,
    );
  };

  const on_pxxs_chip_select = (event: CustomEvent<AutocompleteOption<string>>): void => {
    if (disabled) return;

    // Can only select 7 drivers
    if (pxxs_chips.length >= 7) return;

    // Can only select a driver once (because we display the PXX, check for string suffixes)
    if (pxxs_chips.some((label: string) => label.endsWith(event.detail.value))) return;

    // Manage labels that are displayed
    pxxs_chips.push(`P${(currentrace?.pxx ?? -10) + pxxs_chips.length - 3}: ${event.detail.value}`);
    pxxs_input = "";

    // Manage ids that are submitted via form
    const id: string = get_by_value(drivers ?? [], "code", event.detail.value)?.id ?? "Invalid";
    if (!pxxs_ids.includes(id)) {
      pxxs_ids.push(id);
    }
  };

  const on_pxxs_chip_remove = (event: CustomEvent): void => {
    pxxs_ids.splice(event.detail.chipIndex, 1);

    pxxs_chips = pxxs_chips.map(
      (label: string, index: number) =>
        `P${(currentrace?.pxx ?? -10) + index - 3}: ${label.split(" ").pop()}`,
    );
  };

  const on_dnfs_chip_select = (event: CustomEvent<AutocompleteOption<string>>): void => {
    if (disabled) return;

    // Can only select a driver once
    if (dnfs_chips.includes(event.detail.value)) return;

    // Manage labels that are displayed
    dnfs_chips.push(event.detail.value);
    dnfs_input = "";

    // Manage ids that are submitted via form
    const id: string = get_by_value(drivers ?? [], "code", event.detail.value)?.id ?? "Invalid";
    if (!dnfs_ids.includes(id)) {
      dnfs_ids.push(id);
    }
  };

  const on_dnfs_chip_remove = (event: CustomEvent): void => {
    dnfs_ids.splice(event.detail.chipIndex, 1);
  };
</script>

<Card width="w-full sm:w-[512px]">
  <form method="POST" enctype="multipart/form-data" use:enhance onsubmit={() => modalStore.close()}>
    <!-- This is also disabled, because the ID should only be -->
    <!-- "leaked" to users that are allowed to use the inputs -->
    {#if result && !disabled}
      <input name="id" type="hidden" value={result.id} />
    {/if}

    <!-- Send the input chips ids -->
    {#each pxxs_ids as pxxs_id}
      <input name="pxxs" type="hidden" {disabled} value={pxxs_id} />
    {/each}
    {#each dnfs_ids as dnfs_id}
      <input name="dnfs" type="hidden" {disabled} value={dnfs_id} />
    {/each}

    <!-- Race select input -->
    {#await data.races then races}
      <Dropdown
        name="race"
        bind:value={race_select_value}
        options={race_dropdown_options(races)}
        onchange={on_race_select}
        {labelwidth}
        {disabled}
        {required}
      >
        Race
      </Dropdown>
    {/await}

    <div class="mt-2 flex flex-col gap-2">
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
          options={dnfs_options}
          denylist={dnfs_chips}
          on:selection={on_dnfs_chip_select}
        />
      </div>

      <!-- Save/Delete buttons -->
      <div class="flex items-center justify-end gap-2">
        {#if result}
          <Button
            formaction="?/update_raceresult"
            color="secondary"
            {disabled}
            submit
            width="w-1/2"
          >
            Save
          </Button>
          <Button formaction="?/delete_raceresult" color="primary" {disabled} submit width="w-1/2">
            Delete
          </Button>
        {:else}
          <Button
            formaction="?/create_raceresult"
            color="tertiary"
            {disabled}
            submit
            width="w-full"
          >
            Create Result
          </Button>
        {/if}
      </div>
    </div>
  </form>
</Card>
