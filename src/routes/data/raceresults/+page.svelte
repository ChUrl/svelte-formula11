<script lang="ts">
  import { getModalStore, type ModalSettings, type ModalStore } from "@skeletonlabs/skeleton";
  import type { PageData } from "./$types";
  import { Button, Table, type TableColumn } from "$lib/components";
  import { get_by_value } from "$lib/database";
  import type { Driver } from "$lib/schema";
  import { PXX_COLORS } from "$lib/config";

  let { data }: { data: PageData } = $props();

  const results_columns: TableColumn[] = [
    {
      data_value_name: "race",
      label: "Step",
      valuefun: async (value: string): Promise<string> =>
        `<span class='badge variant-filled-surface'>${get_by_value(data.races, "id", value)?.step}</span>`,
    },
    {
      data_value_name: "race",
      label: "Race",
      valuefun: async (value: string): Promise<string> =>
        `<span>${get_by_value(data.races, "id", value)?.name}</span>`,
    },
    {
      data_value_name: "race",
      label: "Guessed",
      valuefun: async (value: string): Promise<string> =>
        `<span>P${get_by_value(data.races, "id", value)?.pxx}</span>`,
    },
    {
      data_value_name: "pxxs",
      label: "Standing",
      valuefun: async (value: string): Promise<string> => {
        const pxxs_array: string[] = value.toString().split(",");
        const pxxs_codes: string[] = pxxs_array.map(
          (id: string, index: number) =>
            `<span class='w-10 badge mr-2 text-center' style='background: ${PXX_COLORS[index]};'>${get_by_value(data.drivers, "id", id)?.code ?? "Invalid"}</span>`,
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
        const dnfs_codes: string[] = dnfs_array.map(
          (id: string) =>
            `<span class='w-10 text-center badge mr-2' style='background: ${PXX_COLORS[3]}'>${get_by_value(data.drivers, "id", id)?.code ?? "Invalid"}</span>`,
        );

        return dnfs_codes.join("");
      },
    },
  ];

  const modalStore: ModalStore = getModalStore();

  const results_handler = async (event: Event, id: string) => {
    const modalSettings: ModalSettings = {
      type: "component",
      component: "raceResultCard",
      meta: {
        disable_inputs: !data.admin,
      },
    };

    modalStore.trigger(modalSettings);
  };

  const create_result_handler = (event: Event) => {
    const modalSettings: ModalSettings = {
      type: "component",
      component: "raceResultsCard",
      meta: {
        require_inputs: true,
        disable_inputs: !data.admin,
      },
    };

    modalStore.trigger(modalSettings);
  };
</script>

<div class="pb-2">
  <Button width="w-full" color="tertiary" onclick={create_result_handler} shadow>
    <span class="font-bold">Create Race Result</span>
  </Button>
</div>
<Table data={data.results} columns={results_columns} handler={results_handler} />
