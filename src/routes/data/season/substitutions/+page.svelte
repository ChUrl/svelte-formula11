<script lang="ts">
  import { get_by_value, get_driver_headshot_template } from "$lib/database";
  import { getModalStore, type ModalSettings, type ModalStore } from "@skeletonlabs/skeleton";
  import type { PageData } from "./$types";
  import type { Race, Substitution } from "$lib/schema";
  import { Button, Table, type TableColumn } from "$lib/components";

  let { data }: { data: PageData } = $props();

  // TODO: Cleanup
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
        races: await data.races,
        substitute_select_value: update_substitution_substitute_select_values[substitution.id],
        driver_select_value: update_substitution_for_select_values[substitution.id],
        race_select_value: update_substitution_race_select_values[substitution.id],
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
        races: await data.races,
        substitute_select_value: update_substitution_substitute_select_values["create"],
        driver_select_value: update_substitution_for_select_values["create"],
        disable_inputs: !data.admin,
        race_select_value: update_substitution_race_select_values["create"],
        require_inputs: true,
        headshot_template: get_driver_headshot_template(await data.graphics),
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
