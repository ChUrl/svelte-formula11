<script lang="ts">
  import {
    getModalStore,
    getToastStore,
    type ModalStore,
    type ToastStore,
  } from "@skeletonlabs/skeleton";
  import { Card, Button, Dropdown } from "$lib/components";
  import type { Driver } from "$lib/schema";
  import { DRIVER_HEADSHOT_HEIGHT, DRIVER_HEADSHOT_WIDTH } from "$lib/config";
  import { get_by_value, get_driver_headshot_template } from "$lib/database";
  import { get_error_toast } from "$lib/toast";
  import { pb, pbUser } from "$lib/pocketbase";
  import type { PageData } from "../../../routes/data/season/drivers/$types";
  import { driver_dropdown_options, team_dropdown_options } from "$lib/dropdown";

  interface TeamCardProps {
    /** Data from the page context */
    data: PageData;
  }

  let { data }: TeamCardProps = $props();

  const modalStore: ModalStore = getModalStore();
  if ($modalStore[0].meta) {
    const meta = $modalStore[0].meta;

    data = meta.data;
  }

  const toastStore: ToastStore = getToastStore();

  // Await promises
  let drivers: Driver[] | undefined = $state(undefined);
  data.drivers.then((d: Driver[]) => (drivers = d));

  // Constants
  const labelwidth: string = "110px";

  // Reactive state
  let required: boolean = true;
  let disabled: boolean = $derived(!$pbUser?.admin);
  let driver_value: string = $state("");
  let team_value: string = $state("");

  // Update preview
  $effect(() => {
    if (!drivers) return;
    const src: string = get_by_value(drivers, "id", driver_value)?.headshot_url ?? "";
    const img: HTMLImageElement = document.getElementById("headshot_preview") as HTMLImageElement;
    if (img) img.src = src;
  });

  // Database actions
  const update_driver = (): (() => Promise<void>) => {
    const handler = async (): Promise<void> => {
      if (!driver_value || driver_value === "") {
        toastStore.trigger(get_error_toast("Please select a driver!"));
        return;
      }
      const old_driver: Driver | undefined = get_by_value(await data.drivers, "id", driver_value);
      if (!old_driver) {
        toastStore.trigger(get_error_toast("Unable to lookup driver!"));
        return;
      }
      if (!old_driver.headshot_url) {
        toastStore.trigger(get_error_toast("Unable to lookup driver headshot!"));
        return;
      }
      if (!team_value || team_value === "" || team_value === old_driver.team) {
        toastStore.trigger(get_error_toast("Please select a new team!"));
        return;
      }

      // Create a new driver
      const headshot_response = await fetch(old_driver.headshot_url);
      const headshot_blob = await headshot_response.blob();
      let new_driver_data = {
        code: old_driver.code,
        firstname: old_driver.firstname,
        lastname: old_driver.lastname,
        headshot: headshot_blob, // NOTE: Duplicates the image, but no issue for low volume
        team: team_value,
        active: true,
        started_active: false,
      };
      try {
        await pb.collection("drivers").create(new_driver_data);

        modalStore.close();
      } catch (error) {
        toastStore.trigger(get_error_toast("" + error));
        return;
      }

      // Disable the old driver
      let old_driver_data = {
        active: false,
      };
      try {
        await pb.collection("drivers").update(driver_value, old_driver_data);

        modalStore.close();
      } catch (error) {
        toastStore.trigger(get_error_toast("" + error));
      }
    };

    return handler;
  };
</script>

<Card
  imgsrc={get_driver_headshot_template(data.graphics)}
  imgid="headshot_preview"
  width="w-full sm:w-auto"
  imgwidth={DRIVER_HEADSHOT_WIDTH}
  imgheight={DRIVER_HEADSHOT_HEIGHT}
  imgonclick={(event: Event) => modalStore.close()}
>
  <div class="flex flex-col gap-2">
    <!-- Driver select -->
    {#await data.drivers then drivers}
      <Dropdown
        bind:value={driver_value}
        options={driver_dropdown_options(drivers.filter((driver: Driver) => driver.active))}
        {labelwidth}
        {disabled}
        {required}
      >
        Driver
      </Dropdown>
    {/await}

    <!-- New team select -->
    {#await data.teams then teams}
      <Dropdown
        bind:value={team_value}
        options={team_dropdown_options(teams)}
        {labelwidth}
        {disabled}
        {required}
      >
        New Team
      </Dropdown>
    {/await}

    <!-- Save/Delete buttons -->
    <div class="flex justify-end gap-2">
      <Button onclick={update_driver()} color="tertiary" {disabled} width="w-full">
        Switch Team
      </Button>
    </div>
  </div>
</Card>
