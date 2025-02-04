<script lang="ts">
  import { Card, Button, Dropdown } from "$lib/components";
  import type { Driver, Race, RacePick, User } from "$lib/schema";
  import { get_by_value } from "$lib/database";
  import type { Action } from "svelte/action";
  import { getModalStore, type ModalStore } from "@skeletonlabs/skeleton";
  import { DRIVER_HEADSHOT_HEIGHT, DRIVER_HEADSHOT_WIDTH } from "$lib/config";
  import { driver_dropdown_options } from "$lib/dropdown";
  import { enhance } from "$app/forms";

  interface RacePickCardProps {
    /** The [RacePick] object used to prefill values. */
    racepick?: RacePick | undefined;

    /** The [Race] object containing the place to guess */
    currentrace: Race | null;

    /** The [User] currently logged in */
    user?: User;

    /** The drivers (to display the headshot) */
    drivers: Driver[];

    /** Disable all inputs if [true] */
    disable_inputs?: boolean;

    /** The [src] of the driver headshot template preview */
    headshot_template?: string;

    /** The value this component's pxx select dropdown will bind to */
    pxx_select_value: string;

    /** The value this component's dnf select dropdown will bind to */
    dnf_select_value: string;
  }

  let {
    racepick = undefined,
    currentrace = null,
    user = undefined,
    drivers,
    disable_inputs = false,
    headshot_template = "",
    pxx_select_value,
    dnf_select_value,
  }: RacePickCardProps = $props();

  const modalStore: ModalStore = getModalStore();
  if ($modalStore[0].meta) {
    const meta = $modalStore[0].meta;

    // Stuff thats required for the "update" card
    racepick = meta.racepick;
    currentrace = meta.currentrace;
    user = meta.user;
    drivers = meta.drivers;
    disable_inputs = meta.disable_inputs;
    headshot_template = meta.headshot_template;
    pxx_select_value = meta.pxx_select_value;
    dnf_select_value = meta.dnf_select_value;
  }

  // This action is used on the <Dropdown> element.
  // It will trigger once the Dropdown's <input> elements is mounted.
  // This way we'll receive a reference to the object so we can register our event handler.
  const register_pxx_preview_handler: Action = (node: HTMLElement) => {
    node.addEventListener("DropdownChange", update_pxx_preview);
  };

  // This event handler is registered to the Dropdown's <input> element through the action above.
  const update_pxx_preview = (event: Event) => {
    const target: HTMLInputElement = event.target as HTMLInputElement;

    // The option "label" gets put into the Dropdown's input value,
    // so we need to lookup the driver by "code".
    const src: string = get_by_value(drivers, "code", target.value)?.headshot_url || "";
    if (src) {
      const preview: HTMLImageElement = document.getElementById(
        `update_substitution_headshot_preview_${racepick?.id ?? "create"}`,
      ) as HTMLImageElement;

      if (preview) preview.src = src;
    }
  };
</script>

<Card
  imgsrc={get_by_value(drivers, "id", racepick?.pxx ?? "")?.headshot_url ?? headshot_template}
  imgid="update_substitution_headshot_preview_{racepick?.id ?? 'create'}"
  width="w-full sm:w-auto"
  imgwidth={DRIVER_HEADSHOT_WIDTH}
  imgheight={DRIVER_HEADSHOT_HEIGHT}
  imgonclick={(event: Event) => modalStore.close()}
>
  <form method="POST" enctype="multipart/form-data" use:enhance>
    <!-- This is also disabled, because the ID should only be -->
    <!-- "leaked" to users that are allowed to use the inputs -->
    {#if racepick && !disable_inputs}
      <input name="id" type="hidden" value={racepick.id} />
    {/if}

    <input name="user" type="hidden" value={user?.id} />
    <input name="race" type="hidden" value={currentrace?.id} />

    <div class="flex flex-col gap-2">
      <!-- PXX select -->
      <Dropdown
        name="pxx"
        input_variable={pxx_select_value}
        action={register_pxx_preview_handler}
        options={driver_dropdown_options(drivers)}
        labelwidth="60px"
        disabled={disable_inputs}
      >
        P{currentrace?.pxx ?? "XX"}
      </Dropdown>

      <!-- DNF select -->
      <Dropdown
        name="dnf"
        input_variable={dnf_select_value}
        options={driver_dropdown_options(drivers)}
        labelwidth="60px"
        disabled={disable_inputs}
      >
        DNF
      </Dropdown>

      <!-- Save/Delete buttons -->
      <div class="flex justify-end gap-2">
        {#if racepick}
          <Button
            formaction="?/update_racepick"
            color="secondary"
            disabled={disable_inputs}
            submit
            width="w-1/2"
            onclick={() => modalStore.close()}
          >
            Save Changes
          </Button>
          <Button
            color="primary"
            submit
            disabled={disable_inputs}
            formaction="?/delete_racepick"
            width="w-1/2"
            onclick={() => modalStore.close()}
          >
            Delete
          </Button>
        {:else}
          <Button
            formaction="?/create_racepick"
            color="tertiary"
            submit
            width="w-full"
            onclick={() => modalStore.close()}
          >
            Make Pick
          </Button>
        {/if}
      </div>
    </div>
  </form>
</Card>
