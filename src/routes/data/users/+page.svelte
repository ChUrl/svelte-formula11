<script lang="ts">
  import { Table, type TableColumn } from "$lib/components";
  import { getModalStore, type ModalStore } from "@skeletonlabs/skeleton";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const users_columns: TableColumn[] = [
    {
      data_value_name: "username",
      label: "Username",
      valuefun: async (value: string): Promise<string> =>
        `<span class='badge variant-filled-surface'>${value}</span>`,
    },
    {
      data_value_name: "firstname",
      label: "First Name",
    },
    {
      data_value_name: "avatar_url",
      label: "Avatar",
      valuefun: async (value: string): Promise<string> => {
        if (value) {
          return `<img class='rounded-full w-10' src='${value}'/>`;
        }

        // The line height matches h-10 (40px)
        return `<div class='rounded-full w-10 h-10 bg-surface-500 text-center align-middle' style='line-height: 40px;'>None</div>`;
      },
    },
    {
      data_value_name: "admin",
      label: "Admin",
      valuefun: async (value: boolean): Promise<string> =>
        `<span class='badge variant-filled-${value ? "tertiary" : "primary"} text-center'>${value ? "Yes" : "No"}</span>`,
    },
  ];

  const modalStore: ModalStore = getModalStore();
  const users_handler = async (event: Event, id: string) => {
    // Should an admin be able to do anything here?
    // Or can users only change themselves?
  };
</script>

<Table data={data.users} columns={users_columns} handler={users_handler} />
