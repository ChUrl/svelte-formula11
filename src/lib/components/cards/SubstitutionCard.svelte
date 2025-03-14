<script lang="ts">
  import { Card, Button, Dropdown } from "$lib/components";
  import type { Driver, Substitution } from "$lib/schema";
  import { get_by_value, get_driver_headshot_template } from "$lib/database";
  import {
    getModalStore,
    getToastStore,
    type ModalStore,
    type ToastStore,
  } from "@skeletonlabs/skeleton";
  import { DRIVER_HEADSHOT_HEIGHT, DRIVER_HEADSHOT_WIDTH } from "$lib/config";
  import { driver_dropdown_options, race_dropdown_options } from "$lib/dropdown";
  import { get_error_toast } from "$lib/toast";
  import { pb, pbUser } from "$lib/pocketbase";
  import type { PageData } from "../../../routes/data/season/substitutions/$types";

  interface SubstitutionCardProps {
    /** Data passed from the page context */
    data: PageData;

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

  const toastStore: ToastStore = getToastStore();

  // Await promises
  let drivers: Driver[] | undefined = $state(undefined);
  data.drivers.then((d: Driver[]) => (drivers = d));

  // Constants
  const labelwidth: string = "120px";

  // Reactive state
  let required: boolean = $derived(!substitution);
  let disabled: boolean = $derived(!$pbUser?.admin);
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

  // Database actions
  const update_substitution = (create?: boolean): (() => Promise<void>) => {
    const handler = async (): Promise<void> => {
      if (!substitute_value || substitute_value === "") {
        toastStore.trigger(get_error_toast("Please select a substitute driver!"));
        return;
      }
      if (!driver_value || driver_value === "") {
        toastStore.trigger(get_error_toast("Please select a replaced driver!"));
        return;
      }
      if (!race_value || race_value === "") {
        toastStore.trigger(get_error_toast("Please select a race!"));
        return;
      }

      const substitution_data = {
        substitute: substitute_value,
        for: driver_value,
        race: race_value,
      };

      try {
        if (create) {
          await pb.collection("substitutions").create(substitution_data);
        } else {
          if (!substitution?.id) {
            toastStore.trigger(get_error_toast("Invalid substitution id!"));
            return;
          }
          await pb.collection("substitutions").update(substitution.id, substitution_data);
        }
        modalStore.close();
      } catch (error) {
        toastStore.trigger(get_error_toast("" + error));
      }
    };
    return handler;
  };

  const delete_substitution = async (): Promise<void> => {
    if (!substitution?.id) {
      toastStore.trigger(get_error_toast("Invalid substitution id!"));
      return;
    }

    try {
      await pb.collection("substitutions").delete(substitution.id);
      modalStore.close();
    } catch (error) {
      toastStore.trigger(get_error_toast("" + error));
    }
  };
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
    <div class="flex flex-col gap-2">
      <!-- Substitute select -->
      <Dropdown
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
          <Button onclick={update_substitution()} color="secondary" {disabled} width="w-1/2">
            Save Changes
          </Button>
          <Button onclick={delete_substitution} color="primary" {disabled} width="w-1/2">
            Delete
          </Button>
        {:else}
          <Button onclick={update_substitution(true)} color="tertiary" {disabled} width="w-full">
            Create Substitution
          </Button>
        {/if}
      </div>
    </div>
  </Card>
{/await}
