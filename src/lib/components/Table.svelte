<script lang="ts">
  import { type TableColumn } from "$lib/components";

  interface TableProps {
    /** The data that is displayed inside the table. Any array of arbitrary key-value objects. */
    data: any[];

    /** The columns the table should have. */
    columns: TableColumn[];
  }

  let { data, columns }: TableProps = $props();
</script>

<div class="table-container bg-white shadow">
  <table class="table table-interactive table-compact bg-white">
    <thead>
      <tr class="bg-white">
        {#each columns as col}
          <th>{col.label}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each data as row}
        <tr>
          {#each columns as col}
            {#if col.valuefun}
              <td>{@html col.valuefun(row[col.data_value_name])}</td>
            {:else}
              <td>{row[col.data_value_name]}</td>
            {/if}
          {/each}
        </tr>
      {/each}
    </tbody>
    <!-- <tfoot> -->
    <!--   <tr> -->
    <!--     <th colspan="3">Calculated Total Weight</th> -->
    <!--     <td>{totalWeight}</td> -->
    <!--   </tr> -->
    <!-- </tfoot> -->
  </table>
</div>
