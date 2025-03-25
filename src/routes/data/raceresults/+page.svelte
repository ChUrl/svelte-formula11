<script lang="ts">
  import { getModalStore, type ModalSettings, type ModalStore } from "@skeletonlabs/skeleton";
  import type { PageData } from "./$types";
  import { Button, Table, type TableColumn } from "$lib/components";
  import { get_by_value } from "$lib/database";
  import { PXX_COLORS } from "$lib/config";
  import type { RaceResult } from "$lib/schema";

  let { data }: { data: PageData } = $props();

  const modalStore: ModalStore = getModalStore();

  const result_handler = async (event: Event, id?: string) => {
    const result: RaceResult | undefined = get_by_value(
      await data.raceresults,
      "id",
      id ?? "Invalid",
    );

    if (id && !result) return;

    const modalSettings: ModalSettings = {
      type: "component",
      component: "raceResultCard",
      meta: {
        data,
        result,
      },
    };

    modalStore.trigger(modalSettings);
  };

  const results_columns: TableColumn[] = $derived([
    {
      data_value_name: "race",
      label: "Step",
      valuefun: async (value: string): Promise<string> =>
        `<span class='badge variant-filled-surface'>${get_by_value(await data.races, "id", value)?.step}</span>`,
    },
    {
      data_value_name: "race",
      label: "Race",
      valuefun: async (value: string): Promise<string> =>
        `<span>${get_by_value(await data.races, "id", value)?.name}</span>`,
    },
    {
      data_value_name: "race",
      label: "Guessed",
      valuefun: async (value: string): Promise<string> =>
        `<span>P${get_by_value(await data.races, "id", value)?.pxx}</span>`,
    },
    {
      data_value_name: "pxxs",
      label: "Standing",
      valuefun: async (value: string): Promise<string> => {
        if (value.length === 0 || value === "") return "";

        const pxxs_array: string[] = value.toString().split(",");
        const pxxs_codes: string[] = await Promise.all(
          pxxs_array.map(
            async (id: string, index: number) =>
              `<span class='w-10 badge mr-2 text-center' style='background: ${PXX_COLORS[index]};'>${get_by_value(await data.drivers, "id", id)?.code ?? "Invalid"}</span>`,
          ),
        );

        return pxxs_codes.join("");
      },
    },
    {
      data_value_name: "dnfs",
      label: "DNFs",
      valuefun: async (value: string): Promise<string> => {
        if (value.length === 0 || value === "") return "";

        const dnfs_array: string[] = value.toString().split(",");
        const dnfs_codes: string[] = await Promise.all(
          dnfs_array.map(
            async (id: string) =>
              `<span class='w-10 text-center badge mr-2' style='background: ${PXX_COLORS[3]}'>${get_by_value(await data.drivers, "id", id)?.code ?? "Invalid"}</span>`,
          ),
        );

        return dnfs_codes.join("");
      },
    },
  ]);
</script>

<svelte:head>
  <title>Formula 11 - Race Results</title>
</svelte:head>

<div class="pb-2">
  <Button width="w-full" color="tertiary" onclick={result_handler} shadow>
    <span class="font-bold">Create Race Result</span>
  </Button>
</div>
{#await data.raceresults then results}
  <Table
    data={results}
    columns={results_columns}
    handler={result_handler}
    height="h-[calc(100vh-210px)] lg:h-[calc(100vh-126px)]"
  />
{/await}
