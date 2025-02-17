<script lang="ts">
  import { Card, Button, Dropdown } from "$lib/components";
  import type { Driver, RacePick, Substitution } from "$lib/schema";
  import { get_by_value, get_driver_headshot_template } from "$lib/database";
  import {
    getModalStore,
    getToastStore,
    type ModalStore,
    type ToastStore,
  } from "@skeletonlabs/skeleton";
  import { DRIVER_HEADSHOT_HEIGHT, DRIVER_HEADSHOT_WIDTH } from "$lib/config";
  import { driver_dropdown_options } from "$lib/dropdown";
  import { get_error_toast } from "$lib/toast";
  import { invalidateAll } from "$app/navigation";
  import { pb } from "$lib/pocketbase";
  import type { PageData } from "../../../routes/racepicks/$types";

  interface RacePickCardProps {
    /** Data passed from the page context */
    data: PageData;

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

  const toastStore: ToastStore = getToastStore();

  // Await promises
  let drivers: Driver[] | undefined = $state(undefined);
  data.drivers.then((d: Driver[]) => (drivers = d));

  let substitutions: Substitution[] | undefined = $state(undefined);
  data.substitutions.then((s: Substitution[]) => (substitutions = s));

  // Constants
  const labelwidth: string = "70px";

  // Reactive state
  let required: boolean = $derived(!racepick);
  let disabled: boolean = false; // TODO: Datelock
  let pxx_select_value: string = $state(racepick?.pxx ?? "");
  let dnf_select_value: string = $state(racepick?.dnf ?? "");

  let active_drivers_and_substitutes: Driver[] = $derived.by(() => {
    if (!data.currentrace) return [];

    let active_and_substitutes: Driver[] = (drivers ?? []).filter(
      (driver: Driver) => driver.active,
    );

    (substitutions ?? [])
      .filter((substitution: Substitution) => substitution.race === data.currentrace?.id)
      .forEach((substitution: Substitution) => {
        const for_index = active_and_substitutes.findIndex(
          (driver: Driver) => driver.id === substitution.for,
        );
        const sub_index = (drivers ?? []).findIndex(
          (driver: Driver) => driver.id === substitution.substitute,
        );

        active_and_substitutes[for_index] = (drivers ?? [])[sub_index];
      });

    return active_and_substitutes.sort((a: Driver, b: Driver) => a.code.localeCompare(b.code));
  });

  // Update preview
  $effect(() => {
    if (!drivers) return;
    const src: string = get_by_value(drivers, "id", pxx_select_value)?.headshot_url ?? "";
    const img: HTMLImageElement = document.getElementById("headshot_preview") as HTMLImageElement;
    if (img) img.src = src;
  });

  const random_select_handler = (event: Event): void => {
    pxx_select_value =
      active_drivers_and_substitutes[
        Math.floor(Math.random() * active_drivers_and_substitutes.length)
      ].id;

    dnf_select_value =
      active_drivers_and_substitutes[
        Math.floor(Math.random() * active_drivers_and_substitutes.length)
      ].id;
  };

  // Database actions
  const update_racepick = (create?: boolean): (() => Promise<void>) => {
    const handler = async (): Promise<void> => {
      if (!data.user?.id || data.user.id === "") {
        toastStore.trigger(get_error_toast("Invalid user id!"));
        return;
      }
      if (!data.currentrace?.id || data.currentrace.id === "") {
        toastStore.trigger(get_error_toast("Invalid race id!"));
        return;
      }
      if (!pxx_select_value || pxx_select_value === "") {
        toastStore.trigger(get_error_toast("Please enter a PXX guess!"));
        return;
      }
      if (!dnf_select_value || dnf_select_value === "") {
        toastStore.trigger(get_error_toast("Please enter a DNF guess!"));
        return;
      }

      const racepick_data = {
        user: data.user.id,
        race: data.currentrace.id,
        pxx: pxx_select_value,
        dnf: dnf_select_value,
      };

      try {
        if (create) {
          await pb.collection("racepicks").create(racepick_data);
        } else {
          if (!racepick?.id) {
            toastStore.trigger(get_error_toast("Invalid racepick id!"));
            return;
          }
          await pb.collection("racepicks").update(racepick.id, racepick_data);
        }
        invalidateAll();
        modalStore.close();
      } catch (error) {
        toastStore.trigger(get_error_toast("" + error));
      }
    };

    return handler;
  };

  const delete_racepick = async (): Promise<void> => {
    if (!racepick?.id) {
      toastStore.trigger(get_error_toast("Invalid racepick id!"));
      return;
    }

    try {
      await pb.collection("racepicks").delete(racepick.id);
      invalidateAll();
      modalStore.close();
    } catch (error) {
      toastStore.trigger(get_error_toast("" + error));
    }
  };
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
    <div class="flex flex-col gap-2">
      <!-- PXX select -->
      <Dropdown
        bind:value={pxx_select_value}
        options={driver_dropdown_options(active_drivers_and_substitutes)}
        {labelwidth}
        {disabled}
        {required}
      >
        P{data.currentrace?.pxx ?? "XX"}
      </Dropdown>

      <!-- DNF select -->
      <Dropdown
        bind:value={dnf_select_value}
        options={driver_dropdown_options(active_drivers_and_substitutes)}
        {labelwidth}
        {disabled}
        {required}
      >
        DNF
      </Dropdown>

      <Button color="tertiary" {disabled} width="w-full" onclick={random_select_handler}>
        Select Random
      </Button>

      <!-- Save/Delete buttons -->
      <div class="flex justify-end gap-2">
        {#if racepick}
          <Button onclick={update_racepick()} color="secondary" {disabled} width="w-1/2">
            Save Changes
          </Button>
          <Button onclick={delete_racepick} color="primary" {disabled} width="w-1/2">Delete</Button>
        {:else}
          <Button onclick={update_racepick(true)} color="tertiary" {disabled} width="w-full">
            Make Pick
          </Button>
        {/if}
      </div>
    </div>
  </Card>
{/await}
