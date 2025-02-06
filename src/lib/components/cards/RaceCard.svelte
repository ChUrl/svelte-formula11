<script lang="ts">
  import { get_image_preview_event_handler } from "$lib/image";
  import { FileDropzone, getModalStore, type ModalStore } from "@skeletonlabs/skeleton";
  import { Button, Card, Input } from "$lib/components";
  import type { Race, SkeletonData } from "$lib/schema";
  import { RACE_PICTOGRAM_HEIGHT, RACE_PICTOGRAM_WIDTH } from "$lib/config";
  import { enhance } from "$app/forms";
  import { get_race_pictogram_template } from "$lib/database";
  import { format_date } from "$lib/date";

  interface RaceCardProps {
    /** Data passed from the page context */
    data: SkeletonData;

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

  // Constants
  const labelwidth = "80px";
  const dateformat: string = "yyyy-MM-dd'T'HH:mm";

  const clear_sprint = () => {
    (document.getElementById("sqdate") as HTMLInputElement).value = "";
    (document.getElementById("sdate") as HTMLInputElement).value = "";
  };

  // Reactive state
  let required: boolean = $derived(!race);
  let disabled: boolean = $derived(!data.admin);
  let name_value: string = $state(race?.name ?? "");
  let step_value: string = $state(race?.step.toString() ?? "");
  let pxx_value: string = $state(race?.pxx.toString() ?? "");
  let sprintqualidate_value: string = $state("");
  let sprintdate_value: string = $state("");
  let qualidate_value: string = $state("");
  let racedate_value: string = $state("");

  if (race) {
    if (race.sprintqualidate && race.sprintdate) {
      sprintqualidate_value = format_date(race.sprintqualidate, dateformat);
      sprintdate_value = format_date(race.sprintdate, dateformat);
      qualidate_value = format_date(race.qualidate, dateformat);
      racedate_value = format_date(race.racedate, dateformat);
    }
  }
</script>

{#await data.graphics then graphics}
  <Card
    imgsrc={race?.pictogram_url ?? get_race_pictogram_template(graphics)}
    imgid="pictogram_preview"
    width="w-full sm:w-auto"
    imgwidth={RACE_PICTOGRAM_WIDTH}
    imgheight={RACE_PICTOGRAM_HEIGHT}
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
      {#if race && !disabled}
        <input name="id" type="hidden" value={race.id} />
      {/if}

      <div class="flex flex-col gap-2">
        <!-- Driver name input -->
        <Input
          name="name"
          bind:value={name_value}
          autocomplete="off"
          {labelwidth}
          {disabled}
          {required}
        >
          Name
        </Input>
        <Input
          name="step"
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
          name="pxx"
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
          name="sprintqualidate"
          bind:value={sprintqualidate_value}
          autocomplete="off"
          type="datetime-local"
          {labelwidth}
          {disabled}
        >
          SQuali
        </Input>
        <Input
          id="sdate"
          name="sprintdate"
          bind:value={sprintdate_value}
          autocomplete="off"
          type="datetime-local"
          {labelwidth}
          {disabled}
        >
          SRace
        </Input>
        <Input
          name="qualidate"
          bind:value={qualidate_value}
          autocomplete="off"
          type="datetime-local"
          {labelwidth}
          {disabled}
          {required}
        >
          Quali
        </Input>
        <Input
          name="racedate"
          bind:value={racedate_value}
          autocomplete="off"
          type="datetime-local"
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
          {disabled}
          {required}
        >
          <svelte:fragment slot="message">
            <span class="font-bold">Upload Pictogram</span>
          </svelte:fragment>
        </FileDropzone>

        <!-- Save/Delete buttons -->
        <div class="flex justify-end gap-2">
          <Button
            onclick={clear_sprint}
            color="secondary"
            {disabled}
            width={race ? "w-1/3" : "w-1/2"}
          >
            Remove Sprint
          </Button>
          {#if race}
            <Button formaction="?/update_race" color="secondary" {disabled} submit width="w-1/3">
              Save Changes
            </Button>
            <Button formaction="?/delete_race" color="primary" {disabled} submit width="w-1/3">
              Delete
            </Button>
          {:else}
            <Button formaction="?/create_race" color="tertiary" {disabled} submit width="w-1/2">
              Create Race
            </Button>
          {/if}
        </div>
      </div>
    </form>
  </Card>
{/await}
