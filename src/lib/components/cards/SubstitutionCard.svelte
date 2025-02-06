<script lang="ts">
  import { Card, Button, Dropdown } from "$lib/components";
  import type { Driver, SkeletonData, Substitution } from "$lib/schema";
  import { get_by_value, get_driver_headshot_template } from "$lib/database";
  import { getModalStore, type ModalStore } from "@skeletonlabs/skeleton";
  import { DRIVER_HEADSHOT_HEIGHT, DRIVER_HEADSHOT_WIDTH } from "$lib/config";
  import { driver_dropdown_options, race_dropdown_options } from "$lib/dropdown";
  import { enhance } from "$app/forms";

  interface SubstitutionCardProps {
    /** Data passed from the page context */
    data: SkeletonData;

    /** The [Substitution] object used to prefill values. */
    substitution?: Substitution;
  }

  let { data, substitution = undefined }: SubstitutionCardProps = $props();

  const modalStore: ModalStore = getModalStore();
  if ($modalStore[0].meta) {
    const meta = $modalStore[0].meta;

    data = meta.data;
    substitution = meta.substitution;
  }

  // Await promises
  let drivers: Driver[] | undefined = $state(undefined);
  data.drivers.then((d: Driver[]) => (drivers = d));

  // Constants
  const labelwidth: string = "120px";

  // Reactive state
  let required: boolean = $derived(!substitution);
  let disabled: boolean = $derived(!data.admin);
  let active_drivers: Driver[] = $derived((drivers ?? []).filter((d: Driver) => d.active));
  let inactive_drivers: Driver[] = $derived((drivers ?? []).filter((d: Driver) => !d.active));
  let substitute_value: string = $state(substitution?.substitute ?? "");
  let driver_value: string = $state(substitution?.for ?? "");
  let race_value: string = $state(substitution?.race ?? "");

  // Update preview
  $effect(() => {
    if (!drivers) return;
    const src: string = get_by_value(drivers, "id", substitute_value)?.headshot_url ?? "";
    const img: HTMLImageElement = document.getElementById("headshot_preview") as HTMLImageElement;
    if (img) img.src = src;
  });
</script>

{#await Promise.all([data.graphics, data.drivers]) then [graphics, drivers]}
  <Card
    imgsrc={get_by_value<Driver>(drivers, "id", substitution?.substitute ?? "")?.headshot_url ??
      get_driver_headshot_template(graphics)}
    imgid="headshot_preview"
    width="w-full sm:w-auto"
    imgwidth={DRIVER_HEADSHOT_WIDTH}
    imgheight={DRIVER_HEADSHOT_HEIGHT}
    imgonclick={(event: Event) => modalStore.close()}
  >
    <form
      method="POST"
      enctype="multipart/form-data"
      use:enhance
      onsubmit={() => modalStore.close()}
    >
      <!-- This is also disabled, because the ID should only be -->
      <!-- "leaked" to users that are allowed to use the inputs -->
      {#if substitution && !disabled}
        <input name="id" type="hidden" value={substitution.id} />
      {/if}

      <div class="flex flex-col gap-2">
        <!-- Substitute select -->
        <Dropdown
          name="substitute"
          bind:value={substitute_value}
          options={driver_dropdown_options(inactive_drivers)}
          {labelwidth}
          {disabled}
          {required}
        >
          Substitute
        </Dropdown>

        <!-- Driver select -->
        <Dropdown
          name="for"
          bind:value={driver_value}
          options={driver_dropdown_options(active_drivers)}
          {labelwidth}
          {disabled}
          {required}
        >
          For
        </Dropdown>

        <!-- Race select -->
        {#await data.races then races}
          <Dropdown
            name="race"
            bind:value={race_value}
            options={race_dropdown_options(races)}
            {labelwidth}
            {disabled}
            {required}
          >
            Race
          </Dropdown>
        {/await}

        <!-- Save/Delete buttons -->
        <div class="flex justify-end gap-2">
          {#if substitution}
            <Button
              formaction="?/update_substitution"
              color="secondary"
              {disabled}
              submit
              width="w-1/2"
            >
              Save Changes
            </Button>
            <Button
              formaction="?/delete_substitution"
              color="primary"
              {disabled}
              submit
              width="w-1/2"
            >
              Delete
            </Button>
          {:else}
            <Button
              formaction="?/create_substitution"
              color="tertiary"
              {disabled}
              submit
              width="w-full"
            >
              Create Substitution
            </Button>
          {/if}
        </div>
      </div>
    </form>
  </Card>
{/await}
