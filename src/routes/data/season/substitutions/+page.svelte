<script lang="ts">
  import { get_by_value } from "$lib/database";
  import { getModalStore, type ModalSettings, type ModalStore } from "@skeletonlabs/skeleton";
  import type { PageData } from "./$types";
  import type { Race, Substitution } from "$lib/schema";
  import { Button, Table, type TableColumn } from "$lib/components";
  import { pbUser } from "$lib/pocketbase";

  let { data }: { data: PageData } = $props();

  let disabled: boolean = $derived(!$pbUser?.admin);

  const modalStore: ModalStore = getModalStore();
  const substitution_handler = async (event: Event, id?: string) => {
    const substitution: Substitution | undefined = get_by_value(
      await data.substitutions,
      "id",
      id ?? "Invalid",
    );

    if (id && !substitution) return;

    const modalSettings: ModalSettings = {
      type: "component",
      component: "substitutionCard",
      meta: {
        data,
        substitution,
      },
    };

    modalStore.trigger(modalSettings);
  };

  const substitutions_columns: TableColumn[] = $derived([
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
  ]);
</script>

<svelte:head>
  <title>Formula 11 - Substitutions</title>
</svelte:head>

<div class="pb-2">
  <Button width="w-full" color="tertiary" onclick={substitution_handler} shadow {disabled}>
    <span class="font-bold">Create New Substitution</span>
  </Button>
</div>
{#await data.substitutions then substitutions}
  <Table
    data={substitutions}
    columns={substitutions_columns}
    handler={substitution_handler}
    height="h-[calc(100vh-260px)] lg:h-[calc(100vh-180px)]"
  />
{/await}
