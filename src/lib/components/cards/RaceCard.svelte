<script lang="ts">
  import { get_image_preview_event_handler } from "$lib/image";
  import { FileDropzone, getModalStore, type ModalStore } from "@skeletonlabs/skeleton";
  import { Button, Card, Input } from "$lib/components";
  import type { Race } from "$lib/schema";
  import { format } from "date-fns";

  interface RaceCardProps {
    /** The [Race] object used to prefill values. */
    race?: Race | undefined;

    /** Disable all inputs if [true] */
    disable_inputs?: boolean;

    /** Require all inputs if [true] */
    require_inputs?: boolean;

    /** The [src] of the race pictogram template preview */
    pictogram_template?: string;
  }

  let {
    race = undefined,
    disable_inputs = false,
    require_inputs = false,
    pictogram_template = "",
  }: RaceCardProps = $props();

  const modalStore: ModalStore = getModalStore();
  if ($modalStore[0].meta) {
    const meta = $modalStore[0].meta;

    race = meta.race;
  }

  // Dates have to be formatted to datetime-local format
  const dateformat: string = "yyyy-MM-dd'T'HH:mm";
  const sprintqualidate: string | undefined =
    race && race.sprintqualidate ? format(new Date(race.sprintqualidate), dateformat) : undefined;
  const sprintdate: string | undefined =
    race && race.sprintdate ? format(new Date(race.sprintdate), dateformat) : undefined;
  const qualidate: string | undefined = race
    ? format(new Date(race.qualidate), dateformat)
    : undefined;
  const racedate: string | undefined = race
    ? format(new Date(race.racedate), dateformat)
    : undefined;

  const clear_sprint = () => {
    const sprintquali: HTMLInputElement = document.getElementById(
      `race_sprintqualidate_${race?.id ?? "create"}`,
    ) as HTMLInputElement;
    const sprint: HTMLInputElement = document.getElementById(
      `race_sprintdate_${race?.id ?? "create"}`,
    ) as HTMLInputElement;

    sprintquali.value = "";
    sprint.value = "";
  };

  const labelwidth = "80px";
</script>

<Card
  imgsrc={race?.pictogram_url ?? pictogram_template}
  imgid="update_race_pictogram_preview_{race?.id ?? 'create'}"
  width="w-full sm:w-auto"
>
  <form method="POST" enctype="multipart/form-data">
    <!-- This is also disabled, because the ID should only be -->
    <!-- "leaked" to users that are allowed to use the inputs -->
    {#if race && !disable_inputs}
      <input name="id" type="hidden" value={race.id} />
    {/if}

    <div class="flex flex-col gap-2">
      <!-- Driver name input -->
      <Input
        id="race_name_{race?.id ?? 'create'}"
        name="name"
        value={race?.name ?? ""}
        autocomplete="off"
        {labelwidth}
        disabled={disable_inputs}
        required={require_inputs}>Name</Input
      >
      <Input
        id="race_step_{race?.id ?? 'create'}"
        name="step"
        value={race?.step ?? ""}
        autocomplete="off"
        {labelwidth}
        type="number"
        min={1}
        max={24}
        disabled={disable_inputs}
        required={require_inputs}>Step</Input
      >
      <Input
        id="race_pxx_{race?.id ?? 'create'}"
        name="pxx"
        value={race?.pxx ?? ""}
        autocomplete="off"
        {labelwidth}
        type="number"
        min={1}
        max={20}
        disabled={disable_inputs}
        required={require_inputs}>PXX</Input
      >

      <!-- NOTE: Input datetime-local accepts YYYY-mm-ddTHH:MM format -->
      <Input
        id="race_sprintqualidate_{race?.id ?? 'create'}"
        name="sprintqualidate"
        value={sprintqualidate ?? ""}
        autocomplete="off"
        {labelwidth}
        type="datetime-local"
        disabled={disable_inputs}>SQuali</Input
      >
      <Input
        id="race_sprintdate_{race?.id ?? 'create'}"
        name="sprintdate"
        value={sprintdate ?? ""}
        autocomplete="off"
        {labelwidth}
        type="datetime-local"
        disabled={disable_inputs}>SRace</Input
      >
      <Input
        id="race_qualidate_{race?.id ?? 'create'}"
        name="qualidate"
        value={qualidate ?? ""}
        autocomplete="off"
        {labelwidth}
        type="datetime-local"
        disabled={disable_inputs}
        required={require_inputs}>Quali</Input
      >
      <Input
        id="race_racedate_{race?.id ?? 'create'}"
        name="racedate"
        value={racedate ?? ""}
        autocomplete="off"
        {labelwidth}
        type="datetime-local"
        disabled={disable_inputs}
        required={require_inputs}>Race</Input
      >

      <!-- Headshot upload -->
      <FileDropzone
        name="pictogram"
        id="race_pictogram_{race?.id ?? 'create'}"
        onchange={get_image_preview_event_handler(
          `update_race_pictogram_preview_${race?.id ?? "create"}`,
        )}
        disabled={disable_inputs}
        required={require_inputs}
      >
        <svelte:fragment slot="message"><b>Upload Pictogram</b></svelte:fragment>
      </FileDropzone>

      <!-- Save/Delete buttons -->
      <div class="flex justify-end gap-2">
        <Button onclick={clear_sprint} color="secondary" disabled={disable_inputs}
          >Remove Sprint</Button
        >
        {#if race}
          <Button formaction="?/update_race" color="secondary" disabled={disable_inputs} submit
            >Save Changes</Button
          >
          <Button color="primary" submit disabled={disable_inputs} formaction="?/delete_race"
            >Delete</Button
          >
        {:else}
          <Button formaction="?/create_race" color="tertiary" submit>Create Race</Button>
        {/if}
      </div>
    </div>
  </form>
</Card>
