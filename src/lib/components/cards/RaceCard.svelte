<script lang="ts">
  import { get_image_preview_event_handler } from "$lib/image";
  import {
    FileDropzone,
    getModalStore,
    getToastStore,
    type ModalStore,
    type ToastStore,
  } from "@skeletonlabs/skeleton";
  import { Button, Card, Input } from "$lib/components";
  import type { Race } from "$lib/schema";
  import { RACE_PICTOGRAM_HEIGHT, RACE_PICTOGRAM_WIDTH } from "$lib/config";
  import { get_race_pictogram_template } from "$lib/database";
  import { format_date, isodatetimeformat } from "$lib/date";
  import { get_error_toast } from "$lib/toast";
  import { pb, pbUser } from "$lib/pocketbase";
  import { error } from "@sveltejs/kit";
  import type { PageData } from "../../../routes/data/season/races/$types";

  interface RaceCardProps {
    /** Data passed from the page context */
    data: PageData;

    /** The [Race] object used to prefill values. */
    race?: Race;
  }

  let { data, race = undefined }: RaceCardProps = $props();

  const modalStore: ModalStore = getModalStore();
  if ($modalStore[0].meta) {
    const meta = $modalStore[0].meta;

    data = meta.data;
    race = meta.race;
  }

  const toastStore: ToastStore = getToastStore();

  // Constants
  const labelwidth = "85px";

  const clear_sprint = () => {
    (document.getElementById("sqdate") as HTMLInputElement).value = "";
    (document.getElementById("sdate") as HTMLInputElement).value = "";

    sprintqualidate_value = "";
    sprintdate_value = "";
  };

  // Reactive state
  let required: boolean = $derived(!race);
  let disabled: boolean = $derived(!$pbUser?.admin);
  let name_value: string = $state(race?.name ?? "");
  let step_value: string = $state(race?.step.toString() ?? "");
  let pxx_value: string = $state(race?.pxx.toString() ?? "");
  let sprintqualidate_value: string = $state("");
  let sprintdate_value: string = $state("");
  let qualidate_value: string = $state("");
  let racedate_value: string = $state("");
  let pictogram_value: FileList | undefined = $state();

  // Set the initial values if we've clicked on an existing race
  // PocketBase stores in UTC, so resulting values will be offset by 1h here
  if (race) {
    if (race.sprintqualidate && race.sprintdate) {
      sprintqualidate_value = format_date(race.sprintqualidate, isodatetimeformat);
      sprintdate_value = format_date(race.sprintdate, isodatetimeformat);
    }

    qualidate_value = format_date(race.qualidate, isodatetimeformat);
    racedate_value = format_date(race.racedate, isodatetimeformat);
  }

  // Database actions
  const update_race = (create?: boolean): (() => Promise<void>) => {
    const handler = async (): Promise<void> => {
      if (!name_value || name_value === "") {
        toastStore.trigger(get_error_toast("Please enter a name!"));
        return;
      }
      if (!step_value || step_value === "") {
        toastStore.trigger(get_error_toast("Please enter a step!"));
        return;
      }
      if (!pxx_value || pxx_value === "") {
        toastStore.trigger(get_error_toast("Please enter a place to guess (PXX)!"));
        return;
      }
      if (!qualidate_value || qualidate_value === "") {
        toastStore.trigger(get_error_toast("Please enter a qualifying date!"));
        return;
      }
      if (!racedate_value || racedate_value === "") {
        toastStore.trigger(get_error_toast("Please enter a race date!"));
        return;
      }

      // Pictogram handling
      let pictogram_avif: Blob | undefined = undefined;
      const pictogram_file: File | undefined =
        pictogram_value && pictogram_value.length === 1 ? pictogram_value[0] : undefined;

      if (pictogram_file) {
        const pictogram_formdata: FormData = new FormData();
        pictogram_formdata.append("image", pictogram_file);
        pictogram_formdata.append("width", RACE_PICTOGRAM_WIDTH.toString());
        pictogram_formdata.append("height", RACE_PICTOGRAM_HEIGHT.toString());

        try {
          const response = await fetch("/api/compress", {
            method: "POST",
            body: pictogram_formdata,
          });

          if (!response.ok) {
            error(500, "Compression failed.");
          }

          pictogram_avif = await response.blob();
        } catch (error) {
          toastStore.trigger(get_error_toast("" + error));
        }
      }

      // Use toISOString here, as we want to convert from localtime to UTC, which PocketBase uses
      const race_data = {
        name: name_value,
        step: step_value,
        pxx: pxx_value,
        sprintqualidate:
          sprintqualidate_value && sprintqualidate_value !== ""
            ? new Date(sprintqualidate_value).toISOString()
            : null,
        sprintdate:
          sprintdate_value && sprintdate_value != ""
            ? new Date(sprintdate_value).toISOString()
            : null,
        qualidate: new Date(qualidate_value).toISOString(),
        racedate: new Date(racedate_value).toISOString(),
        pictogram: pictogram_avif,
      };

      try {
        if (create) {
          if (!pictogram_avif) {
            toastStore.trigger(get_error_toast("Please upload a single pictogram!"));
            return;
          }
          await pb.collection("races").create(race_data);
        } else {
          if (!race?.id) {
            toastStore.trigger(get_error_toast("Invalid race id!"));
            return;
          }
          await pb.collection("races").update(race.id, race_data);
        }
        modalStore.close();
      } catch (error) {
        toastStore.trigger(get_error_toast("" + error));
      }
    };
    return handler;
  };

  const delete_race = async (): Promise<void> => {
    if (!race?.id) {
      toastStore.trigger(get_error_toast("Invalid race id!"));
      return;
    }

    try {
      await pb.collection("races").delete(race.id);
      modalStore.close();
    } catch (error) {
      toastStore.trigger(get_error_toast("" + error));
    }
  };
</script>

<Card
  imgsrc={race?.pictogram_url ?? get_race_pictogram_template(data.graphics)}
  imgid="pictogram_preview"
  width="w-full sm:w-auto"
  imgwidth={RACE_PICTOGRAM_WIDTH}
  imgheight={RACE_PICTOGRAM_HEIGHT}
  imgonclick={(event: Event) => modalStore.close()}
>
  <div class="flex flex-col gap-2">
    <!-- Driver name input -->
    <Input bind:value={name_value} autocomplete="off" {labelwidth} {disabled} {required}>
      Name
    </Input>
    <Input
      bind:value={step_value}
      autocomplete="off"
      type="number"
      min={1}
      max={24}
      {labelwidth}
      {disabled}
      {required}
    >
      Step
    </Input>
    <Input
      bind:value={pxx_value}
      autocomplete="off"
      type="number"
      min={1}
      max={20}
      {labelwidth}
      {disabled}
      {required}
    >
      PXX
    </Input>

    <!-- NOTE: Input datetime-local accepts YYYY-mm-ddTHH:MM format -->
    <Input
      id="sqdate"
      type="datetime-local"
      bind:value={sprintqualidate_value}
      autocomplete="off"
      {labelwidth}
      {disabled}
    >
      SQuali
    </Input>
    <Input
      id="sdate"
      type="datetime-local"
      bind:value={sprintdate_value}
      autocomplete="off"
      {labelwidth}
      {disabled}
    >
      SRace
    </Input>
    <Input
      type="datetime-local"
      bind:value={qualidate_value}
      autocomplete="off"
      {labelwidth}
      {disabled}
      {required}
    >
      Quali
    </Input>
    <Input
      type="datetime-local"
      bind:value={racedate_value}
      autocomplete="off"
      {labelwidth}
      {disabled}
      {required}
    >
      Race
    </Input>

    <!-- Headshot upload -->
    <FileDropzone
      name="pictogram"
      onchange={get_image_preview_event_handler("pictogram_preview")}
      bind:files={pictogram_value}
      {disabled}
      {required}
    >
      <svelte:fragment slot="message">
        <span class="font-bold">Upload Pictogram</span>
      </svelte:fragment>
    </FileDropzone>

    <!-- Save/Delete buttons -->
    <div class="flex justify-end gap-2">
      <Button onclick={clear_sprint} color="secondary" {disabled} width={race ? "w-1/3" : "w-1/2"}>
        Remove Sprint
      </Button>
      {#if race}
        <Button onclick={update_race()} color="secondary" {disabled} width="w-1/3">
          Save Changes
        </Button>
        <Button onclick={delete_race} color="primary" {disabled} width="w-1/3">Delete</Button>
      {:else}
        <Button onclick={update_race(true)} color="tertiary" {disabled} width="w-1/2">
          Create Race
        </Button>
      {/if}
    </div>
  </div>
</Card>
