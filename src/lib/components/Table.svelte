<script lang="ts">
  import { type TableColumn } from "$lib/components";

  interface TableProps {
    /** The data that is displayed inside the table. Any array of arbitrary key-value objects. */
    data: any[];

    /** The columns the table should have. */
    columns: TableColumn[];

    /** Optional height classes */
    height?: string;

    /** An optional function handling clicking on a table row */
    handler?: (event: Event, id: string) => Promise<void>;
  }

  let { data, columns, height = "", handler = undefined }: TableProps = $props();
</script>

{#if data.length > 0}
  <div class="table-container bg-white shadow {height}">
    <table class="table table-compact !overflow-scroll bg-white">
      <thead class="sticky top-0">
        <tr class="bg-surface-500">
          {#each columns as col}
            <th class="!px-3">{col.label}</th>
          {/each}
        </tr>
      </thead>

      <tbody>
        {#each data as row}
          <tr
            class="cursor-pointer bg-surface-300"
            onclick={async (event: Event) => {
              if (handler) await handler(event, row.id);
            }}
          >
            {#each columns as col}
              {#if col.valuefun}
                <td class="!align-middle">
                  {#await col.valuefun(row[col.data_value_name]) then value}{@html value}{/await}
                </td>
              {:else}
                <td class="!align-middle">{row[col.data_value_name]}</td>
              {/if}
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
