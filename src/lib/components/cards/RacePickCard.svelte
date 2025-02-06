<script lang="ts">
  import { Card, Button, Dropdown } from "$lib/components";
  import type {
    CurrentPickedUser,
    Driver,
    Race,
    RacePick,
    RaceResult,
    SkeletonData,
    Substitution,
  } from "$lib/schema";
  import { get_by_value, get_driver_headshot_template } from "$lib/database";
  import type { Action } from "svelte/action";
  import { getModalStore, type ModalStore } from "@skeletonlabs/skeleton";
  import { DRIVER_HEADSHOT_HEIGHT, DRIVER_HEADSHOT_WIDTH } from "$lib/config";
  import { driver_dropdown_options } from "$lib/dropdown";
  import { enhance } from "$app/forms";

  interface RacePickCardProps {
    /** Data passed from the page context */
    data: SkeletonData & {
      currentrace: Race;
      racepicks: Promise<RacePick[]>;
      currentpickedusers: Promise<CurrentPickedUser[]>;
      raceresults: Promise<RaceResult[]>;
    };

    /** The [RacePick] object used to prefill values. */
    racepick?: RacePick;
  }

  let { data, racepick = undefined }: RacePickCardProps = $props();

  const modalStore: ModalStore = getModalStore();
  if ($modalStore[0].meta) {
    const meta = $modalStore[0].meta;

    data = meta.data;
    racepick = meta.racepick;
  }

  // Await promises
  let drivers: Driver[] | undefined = $state(undefined);
  data.drivers.then((d: Driver[]) => (drivers = d));

  const required: boolean = $derived(!racepick);
  const disabled: boolean = $derived(!data.admin);
  const labelwidth: string = "60px";

  const active_drivers_and_substitutes: Promise<Driver[]> = $derived.by(async () => {
    if (!data.currentrace) return [];

    let drivers: Driver[] = await data.drivers;
    let substitutions: Substitution[] = await data.substitutions;

    let active_and_substitutes: Driver[] = drivers.filter((driver: Driver) => driver.active);

    substitutions
      .filter((substitution: Substitution) => substitution.race === data.currentrace?.id)
      .forEach((substitution: Substitution) => {
        const for_index = active_and_substitutes.findIndex(
          (driver: Driver) => driver.id === substitution.for,
        );
        const sub_index = drivers.findIndex(
          (driver: Driver) => driver.id === substitution.substitute,
        );

        active_and_substitutes[for_index] = drivers[sub_index];
      });

    return active_and_substitutes.sort((a: Driver, b: Driver) => a.code.localeCompare(b.code));
  });

  let pxx_select_value: string = $state(racepick?.pxx ?? "");
  let dnf_select_value: string = $state(racepick?.dnf ?? "");

  // Update preview
  $effect(() => {
    if (!drivers) return;
    const src: string = get_by_value(drivers, "id", pxx_select_value)?.headshot_url ?? "";
    const img: HTMLImageElement = document.getElementById("headshot_preview") as HTMLImageElement;
    if (img) img.src = src;
  });
</script>

{#await Promise.all([data.graphics, data.drivers]) then [graphics, drivers]}
  <Card
    imgsrc={get_by_value<Driver>(drivers, "id", racepick?.pxx ?? "")?.headshot_url ??
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
      {#if racepick && !disabled}
        <input name="id" type="hidden" value={racepick.id} />
      {/if}

      <input name="user" type="hidden" value={data.user?.id} />
      <input name="race" type="hidden" value={data.currentrace?.id} />

      <div class="flex flex-col gap-2">
        <!-- PXX select -->
        {#await active_drivers_and_substitutes then pxx_drivers}
          <Dropdown
            name="pxx"
            bind:value={pxx_select_value}
            options={driver_dropdown_options(pxx_drivers)}
            {labelwidth}
            {disabled}
            {required}
          >
            P{data.currentrace?.pxx ?? "XX"}
          </Dropdown>

          <!-- DNF select -->
          <Dropdown
            name="dnf"
            bind:value={dnf_select_value}
            options={driver_dropdown_options(pxx_drivers)}
            {labelwidth}
            {disabled}
            {required}
          >
            DNF
          </Dropdown>
        {/await}

        <!-- Save/Delete buttons -->
        <div class="flex justify-end gap-2">
          {#if racepick}
            <Button
              formaction="?/update_racepick"
              color="secondary"
              {disabled}
              submit
              width="w-1/2"
            >
              Save Changes
            </Button>
            <Button formaction="?/delete_racepick" color="primary" {disabled} submit width="w-1/2">
              Delete
            </Button>
          {:else}
            <Button
              formaction="?/create_racepick"
              color="tertiary"
              {disabled}
              submit
              width="w-full"
            >
              Make Pick
            </Button>
          {/if}
        </div>
      </div>
    </form>
  </Card>
{/await}
