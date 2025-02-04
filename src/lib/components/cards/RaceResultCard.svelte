<script lang="ts">
  import {
    Autocomplete,
    getModalStore,
    InputChip,
    type AutocompleteOption,
    type ModalStore,
  } from "@skeletonlabs/skeleton";
  import { Button, Card, Dropdown } from "$lib/components";
  import type { Driver, Race, RaceResult } from "$lib/schema";
  import { get_by_value } from "$lib/database";
  import { race_dropdown_options } from "$lib/dropdown";
  import { enhance } from "$app/forms";

  interface RaceResultCardProps {
    /** The [RaceResult] object used to prefill values. */
    result?: RaceResult;

    /** The list of [Drivers] for the driver selection */
    drivers: Driver[];

    /** The list of [Races] for the race selection + PXX display */
    races: Race[];

    /** Disable all inputs if [true] */
    disable_inputs?: boolean;

    /** Require all inputs if [true] */
    require_inputs?: boolean;
  }

  let {
    result = undefined,
    drivers,
    races,
    disable_inputs = false,
    require_inputs = false,
  }: RaceResultCardProps = $props();

  // TODO: This does not work at all. Why does it work for other cards???
  //       Everything exists here, but in the markup it is undefined???
  const modalStore: ModalStore = getModalStore();
  if ($modalStore[0].meta) {
    const meta = $modalStore[0].meta;

    // Stuff thats required for the "update" card
    disable_inputs = meta.disable_inputs;
    drivers = meta.drivers;
    races = meta.races;
    result = meta.result;

    // Stuff thats additionally required for the "create" card
    require_inputs = meta.require_inputs;
  }

  const currentrace: Race | undefined = get_by_value(races, "id", result?.race ?? "Invalid");

  // TODO: I have no fucking idea why this solves things...
  //       Without this, the original values passed through the modalStore
  //       are undefined within the markup, but not within the <script>...
  const disable_inputs2 = disable_inputs;
  const drivers2 = drivers;
  const races2 = races;
  const result2 = result;
  const require_inputs2 = require_inputs;

  let race_select_value: string = currentrace?.id ?? "";

  let pxxs_input: string = $state("");
  let pxxs_chips: string[] = $state(
    result2?.pxxs.map(
      (id: string, index: number) =>
        `P${(currentrace?.pxx ?? -10) + index - 3}: ${get_by_value(drivers2, "id", id)?.code ?? "Invalid"}`,
    ) ?? [],
  );
  let dnfs_input: string = $state("");
  let dnfs_chips: string[] = $state(
    result2?.dnfs.map((id: string) => get_by_value(drivers2, "id", id)?.code ?? "Invalid") ?? [],
  );

  // This is the actual data that gets sent through the form
  let pxxs_ids: string[] = $state(result2?.pxxs ?? []);
  let dnfs_ids: string[] = $state(result2?.dnfs ?? []);

  const pxxs_options: AutocompleteOption<string>[] = drivers2.map((driver: Driver) => {
    return {
      // NOTE: Because Skeleton displays the values inside the autocomplete input,
      //       we have to supply the driver code twice and manage a list of ids manually (ugh)
      label: driver.code,
      value: driver.code,
    };
  });

  const pxxs_whitelist: string[] = drivers2.map((driver: Driver) => {
    return driver.code;
  });

  const on_pxxs_chip_select = (event: CustomEvent<AutocompleteOption<string>>): void => {
    if (disable_inputs2) return;

    // Can only select 7 drivers
    if (pxxs_chips.length >= 7) return;

    // Can only select a driver once (because we display the PXX, check for string suffixes)
    if (pxxs_chips.some((label: string) => label.endsWith(event.detail.value))) return;

    // Manage labels that are displayed
    pxxs_chips.push(`P${(currentrace?.pxx ?? -10) + pxxs_chips.length - 3}: ${event.detail.value}`);
    pxxs_input = "";

    // Manage ids that are submitted via form
    const id: string = get_by_value(drivers2, "code", event.detail.value)?.id ?? "Invalid";
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
    if (disable_inputs2) return;

    // Can only select a driver once
    if (dnfs_chips.includes(event.detail.value)) return;

    // Manage labels that are displayed
    dnfs_chips.push(event.detail.value);
    dnfs_input = "";

    // Manage ids that are submitted via form
    const id: string = get_by_value(drivers2, "code", event.detail.value)?.id ?? "Invalid";
    if (!dnfs_ids.includes(id)) {
      dnfs_ids.push(id);
    }
  };

  const on_dnfs_chip_remove = (event: CustomEvent): void => {
    dnfs_ids.splice(event.detail.chipIndex, 1);
  };
</script>

<Card width="w-full sm:w-[512px]">
  <form method="POST" enctype="multipart/form-data" use:enhance>
    <!-- This is also disabled, because the ID should only be -->
    <!-- "leaked" to users that are allowed to use the inputs -->
    {#if result2 && !disable_inputs2}
      <input name="id" type="hidden" value={result2.id} />
    {/if}

    <!-- Send the input chips ids -->
    {#each pxxs_ids as pxxs_id}
      <input name="pxxs" type="hidden" disabled={disable_inputs2} value={pxxs_id} />
    {/each}
    {#each dnfs_ids as dnfs_id}
      <input name="dnfs" type="hidden" disabled={disable_inputs2} value={dnfs_id} />
    {/each}

    <!-- Race select input -->
    <Dropdown
      name="race"
      input_variable={race_select_value}
      options={race_dropdown_options(races2)}
      labelwidth="70px"
      disabled={disable_inputs2}
      required={require_inputs2}
    >
      Race
    </Dropdown>

    <div class="mt-2 flex flex-col gap-2">
      <!-- PXXs autocomplete chips -->
      <InputChip
        bind:input={pxxs_input}
        bind:value={pxxs_chips}
        whitelist={pxxs_whitelist}
        allowUpperCase
        placeholder="Select P{(currentrace?.pxx ?? -10) - 3} to P{(currentrace?.pxx ?? -10) + 3}..."
        name="pxxs_codes"
        disabled={disable_inputs2}
        required={require_inputs2}
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
        disabled={disable_inputs2}
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
        {#if result2}
          <Button
            formaction="?/update_raceresult"
            color="secondary"
            disabled={disable_inputs2}
            submit
            width="w-1/2"
            onclick={() => modalStore.close()}
          >
            Save
          </Button>
          <Button
            color="primary"
            submit
            disabled={disable_inputs2}
            formaction="?/delete_raceresult"
            width="w-1/2"
            onclick={() => modalStore.close()}
          >
            Delete
          </Button>
        {:else}
          <Button
            formaction="?/create_raceresult"
            color="tertiary"
            submit
            width="w-full"
            disabled={disable_inputs2}
            onclick={() => modalStore.close()}
          >
            Create Result
          </Button>
        {/if}
      </div>
    </div>
  </form>
</Card>
