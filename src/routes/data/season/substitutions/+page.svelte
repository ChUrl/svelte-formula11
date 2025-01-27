<script lang="ts">
  import { get_by_value } from "$lib/database";
  import { getModalStore, type ModalSettings, type ModalStore } from "@skeletonlabs/skeleton";
  import type { PageData } from "./$types";
  import type { Driver, Race, Substitution } from "$lib/schema";
  import { Button, Table, type DropdownOption, type TableColumn } from "$lib/components";
  import {
    DRIVER_HEADSHOT_HEIGHT,
    DRIVER_HEADSHOT_WIDTH,
    RACE_PICTOGRAM_HEIGHT,
    RACE_PICTOGRAM_WIDTH,
  } from "$lib/config";

  let { data }: { data: PageData } = $props();

  const update_substitution_substitute_select_values: { [key: string]: string } = $state({});
  const update_substitution_for_select_values: { [key: string]: string } = $state({});
  const update_substitution_race_select_values: { [key: string]: string } = $state({});
  data.substitutions.then((substitutions: Substitution[]) =>
    substitutions.forEach((substitution: Substitution) => {
      update_substitution_substitute_select_values[substitution.id] = substitution.substitute;
      update_substitution_for_select_values[substitution.id] = substitution.for;
      update_substitution_race_select_values[substitution.id] = substitution.race;
    }),
  );
  update_substitution_substitute_select_values["create"] = "";
  update_substitution_for_select_values["create"] = "";
  update_substitution_race_select_values["create"] = "";

  const driver_dropdown_options: DropdownOption[] = [];
  data.drivers.then((drivers: Driver[]) =>
    drivers.forEach((driver: Driver) => {
      driver_dropdown_options.push({
        label: driver.code,
        value: driver.id,
        icon_url: driver.headshot_url,
        icon_width: DRIVER_HEADSHOT_WIDTH,
        icon_height: DRIVER_HEADSHOT_HEIGHT,
      });
    }),
  );

  const race_dropdown_options: DropdownOption[] = [];
  data.races.then((races: Race[]) =>
    races.forEach((race: Race) => {
      race_dropdown_options.push({
        label: race.name,
        value: race.id,
        icon_url: race.pictogram_url,
        icon_width: RACE_PICTOGRAM_WIDTH,
        icon_height: RACE_PICTOGRAM_HEIGHT,
      });
    }),
  );

  const substitutions_columns: TableColumn[] = [
    {
      data_value_name: "expand",
      label: "Step",
      valuefun: async (value: { race: Race }): Promise<string> =>
        `<span class='badge variant-filled-surface'>${value.race.step.toString()}</span>`,
    },
    {
      data_value_name: "substitute",
      label: "Substitute",
      valuefun: async (value: string): Promise<string> => {
        const substitute = get_by_value(await data.drivers, "id", value)?.code ?? "Invalid";
        return `<span class='badge variant-filled-surface'>${substitute}</span>`;
      },
    },
    {
      data_value_name: "for",
      label: "For",
      valuefun: async (value: string): Promise<string> =>
        get_by_value(await data.drivers, "id", value)?.code ?? "Invalid",
    },
    {
      data_value_name: "race",
      label: "Race",
      valuefun: async (value: string): Promise<string> =>
        get_by_value(await data.races, "id", value)?.name ?? "Invalid",
    },
  ];

  const modalStore: ModalStore = getModalStore();

  const substitutions_handler = async (event: Event, id: string) => {
    const substitution: Substitution | undefined = get_by_value(await data.substitutions, "id", id);
    if (!substitution) return;

    const modalSettings: ModalSettings = {
      type: "component",
      component: "substitutionCard",
      meta: {
        substitution: substitution,
        drivers: await data.drivers,
        substitute_select_value: update_substitution_substitute_select_values[substitution.id],
        driver_select_value: update_substitution_for_select_values[substitution.id],
        race_select_value: update_substitution_race_select_values[substitution.id],
        driver_select_options: driver_dropdown_options,
        race_select_options: race_dropdown_options,
        disable_inputs: !data.admin,
      },
    };

    modalStore.trigger(modalSettings);
  };

  const create_substitution_handler = async (event: Event) => {
    const modalSettings: ModalSettings = {
      type: "component",
      component: "substitutionCard",
      meta: {
        drivers: await data.drivers,
        substitute_select_value: update_substitution_substitute_select_values["create"],
        driver_select_value: update_substitution_for_select_values["create"],
        disable_inputs: !data.admin,
        race_select_value: update_substitution_race_select_values["create"],
        driver_select_options: driver_dropdown_options,
        race_select_options: race_dropdown_options,
        require_inputs: true,
        headshot_template:
          get_by_value(data.graphics, "name", "driver_headshot_template")?.file_url ?? "Invalid",
      },
    };

    modalStore.trigger(modalSettings);
  };
</script>

<div class="pb-2">
  <Button width="w-full" color="tertiary" onclick={create_substitution_handler} shadow>
    <span class="font-bold">Create New Substitution</span>
  </Button>
</div>
{#await data.substitutions then substitutions}
  <Table data={substitutions} columns={substitutions_columns} handler={substitutions_handler} />
{/await}
