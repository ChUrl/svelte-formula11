<script lang="ts">
  import "../app.css";
  import { onDestroy, onMount, type Snippet } from "svelte";
  import type { LayoutData } from "./$types";
  import { page } from "$app/stores";
  import {
    Button,
    MenuDrawerIcon,
    UserIcon,
    Input,
    PasswordIcon,
    LoadingIndicator,
    DriverCard,
    TeamCard,
    RaceCard,
    SubstitutionCard,
    NameIcon,
    RacePickCard,
    RaceResultCard,
    SeasonPickCard,
    EMailIcon,
  } from "$lib/components";
  import { get_avatar_preview_event_handler } from "$lib/image";
  import {
    AppBar,
    storePopup,
    initializeStores,
    Drawer,
    getDrawerStore,
    Modal,
    Toast,
    getModalStore,
    type DrawerSettings,
    Avatar,
    FileDropzone,
    type DrawerStore,
    type ModalStore,
    type ModalComponent,
    type ToastStore,
    getToastStore,
    SlideToggle,
  } from "@skeletonlabs/skeleton";
  import { computePosition, autoUpdate, offset, shift, flip, arrow } from "@floating-ui/dom";
  import { invalidate } from "$app/navigation";
  import { get_error_toast, get_info_toast, get_warning_toast } from "$lib/toast";
  import { clear_auth, pb, pbUser, refresh_auth, subscribe, unsubscribe } from "$lib/pocketbase";
  import { AVATAR_HEIGHT, AVATAR_WIDTH } from "$lib/config";
  import { error } from "@sveltejs/kit";

  let { data, children }: { data: LayoutData; children: Snippet } = $props();

  // Init skeleton stores for drawer + modal
  initializeStores();

  // Modal config
  const modalStore: ModalStore = getModalStore();
  const modalRegistry: Record<string, ModalComponent> = {
    // Card data (e.g. team, driver etc.) is passed using $modalStore[0].meta
    teamCard: { ref: TeamCard },
    driverCard: { ref: DriverCard },
    raceCard: { ref: RaceCard },
    racePickCard: { ref: RacePickCard },
    raceResultCard: { ref: RaceResultCard },
    seasonPickCard: { ref: SeasonPickCard },
    substitutionCard: { ref: SubstitutionCard },
  };

  // Toast config
  const toastStore: ToastStore = getToastStore();

  // Drawer config
  const drawerStore: DrawerStore = getDrawerStore();
  let drawerOpen: boolean = false;
  let drawerId: string = "";
  drawerStore.subscribe((settings: DrawerSettings) => {
    drawerOpen = settings.open ?? false;
    drawerId = settings.id ?? "";
  });

  const toggle_drawer = (settings: DrawerSettings) => {
    if (drawerOpen) {
      if (drawerId === settings.id) {
        // We clicked the same button to close the drawer
        drawerStore.close();
      } else {
        // We clicked another button to open another drawer
        drawerStore.close();
        setTimeout(() => drawerStore.open(settings), 175);
      }
    } else {
      drawerStore.open(settings);
    }
  };

  const close_drawer = () => drawerStore.close();

  const drawer_settings_base: DrawerSettings = {
    position: "top",
    height: "auto",
    padding: "lg:px-96 pt-14", // pt-14 is 56px, so its missing 4px for the 60px navbar...
    bgDrawer: "bg-surface-100",
    duration: 150,
  };

  const menu_drawer = () => {
    const drawerSettings: DrawerSettings = {
      id: "menu_drawer",
      ...drawer_settings_base,
    };
    toggle_drawer(drawerSettings);
  };

  const data_drawer = () => {
    const drawerSettings: DrawerSettings = {
      id: "data_drawer",
      ...drawer_settings_base,
    };
    toggle_drawer(drawerSettings);
  };

  const login_drawer = () => {
    const drawerSettings: DrawerSettings = {
      id: "login_drawer",
      ...drawer_settings_base,
    };
    toggle_drawer(drawerSettings);
  };

  const profile_drawer = () => {
    const drawerSettings: DrawerSettings = {
      id: "profile_drawer",
      ...drawer_settings_base,
    };
    toggle_drawer(drawerSettings);
  };

  // Popups config
  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

  // Reactive state
  let username_value: string = $state($pbUser?.username ?? "");
  let firstname_value: string = $state($pbUser?.firstname ?? "");
  let email_value: string = $state($pbUser?.email ?? "");
  let password_value: string = $state("");
  let avatar_value: FileList | undefined = $state();

  let registration_mode: boolean = $state(false);

  // Add "Enter" event listeners for login/register text inputs
  const enter_handler = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      // Cancel the default action, if needed
      event.preventDefault();

      registration_mode ? update_profile(true) : login();
    }
  };

  // Database actions
  const login = async (): Promise<void> => {
    if (!username_value || username_value.trim() === "") {
      toastStore.trigger(get_error_toast("Please enter your username!"));
      return;
    }
    if (!password_value || password_value.trim() === "") {
      toastStore.trigger(get_error_toast("Please enter your password!"));
      return;
    }

    try {
      await pb.collection("users").authWithPassword(username_value, password_value);
    } catch (error) {
      toastStore.trigger(get_error_toast("" + error));
    }

    await invalidate("data:user");
    drawerStore.close();
    username_value = $pbUser?.username ?? "";
    firstname_value = $pbUser?.firstname ?? "";
    email_value = $pbUser?.email ?? "";
    password_value = "";
  };

  const logout = async (): Promise<void> => {
    clear_auth();

    await invalidate("data:user");
    drawerStore.close();
    username_value = "";
    firstname_value = "";
    email_value = "";
    password_value = "";
  };

  const update_profile = (create?: boolean): (() => Promise<void>) => {
    const handler = async (): Promise<void> => {
      // Avatar handling
      let avatar_avif: Blob | undefined = undefined;
      const avatar_file: File | undefined =
        avatar_value && avatar_value.length === 1 ? avatar_value[0] : undefined;

      if (avatar_file) {
        const avatar_formdata: FormData = new FormData();
        avatar_formdata.append("image", avatar_file);
        avatar_formdata.append("width", AVATAR_WIDTH.toString());
        avatar_formdata.append("height", AVATAR_HEIGHT.toString());

        try {
          const response = await fetch("/api/compress", {
            method: "POST",
            body: avatar_formdata,
          });

          if (!response.ok) {
            error(500, "Compression failed.");
          }

          avatar_avif = await response.blob();
        } catch (error) {
          toastStore.trigger(get_error_toast("" + error));
        }
      }

      try {
        if (create) {
          if (!username_value || username_value.trim() === "") {
            toastStore.trigger(get_error_toast("Please enter a username!"));
            return;
          }
          if (!firstname_value || firstname_value.trim() === "") {
            toastStore.trigger(get_error_toast("Please enter your first name!"));
            return;
          }
          if (!email_value || email_value.trim() === "") {
            toastStore.trigger(get_error_toast("Please enter your e-mail address!"));
            return;
          }
          if (!password_value || password_value.trim() === "") {
            toastStore.trigger(get_error_toast("Please enter a password!"));
            return;
          }

          await pb.collection("users").create({
            username: username_value.trim(),
            firstname: firstname_value.trim(),
            email: email_value.trim(),
            password: password_value.trim(),
            passwordConfirm: password_value.trim(), // lol
            admin: false,
          });

          await pb.collection("users").requestVerification(email_value.trim());
          toastStore.trigger(get_info_toast("Check your inbox!"));

          // Just in case
          clear_auth();

          await login();
        } else {
          if (!$pbUser?.id || $pbUser.id === "") {
            toastStore.trigger(get_error_toast("Invalid user id!"));
            return;
          }

          await pb.collection("users").update($pbUser.id, {
            username: username_value.trim().length > 0 ? username_value.trim() : $pbUser.username,
            firstname:
              firstname_value.trim().length > 0 ? firstname_value.trim() : $pbUser.firstname,
            avatar: avatar_avif,
          });

          if (email_value && email_value.trim() !== $pbUser.email) {
            await pb.collection("users").requestEmailChange(email_value.trim());

            // When changing the email address, the auth token is invalidated
            await logout();
            toastStore.trigger(get_info_toast("Check your inbox!"));
            toastStore.trigger(
              get_warning_toast("Please login AFTER confirming your e-mail address!", 5000),
            );
          }

          drawerStore.close();
        }
      } catch (error) {
        toastStore.trigger(get_error_toast("" + error));
      }
    };

    return handler;
  };

  // Real-time updates without reloading
  onMount(() =>
    subscribe([
      "users",
      "drivers",
      "racepicks",
      "raceresults",
      "races",
      "seasonpicks",
      "substitutions",
      "teams",

      // The view collections do not receive realtime events
    ]),
  );

  onDestroy(() =>
    unsubscribe([
      "users",
      "drivers",
      "racepicks",
      "raceresults",
      "races",
      "seasonpicks",
      "substitutions",
      "teams",
    ]),
  );
</script>

<LoadingIndicator />

<Modal components={modalRegistry} regionBackdrop="!overflow-y-scroll" />

<Toast zIndex="z-[1000]" />

<Drawer zIndex="z-30">
  <!-- Use p-3 because the drawer has a 5px overlap with the navbar -->
  {#if $drawerStore.id === "menu_drawer"}
    <!-- Menu Drawer -->
    <!-- Menu Drawer -->
    <!-- Menu Drawer -->
    <div class="flex flex-col gap-2 p-2 pt-3">
      <Button href="/racepicks" onclick={close_drawer} color="surface" width="w-full" shadow>
        Race Picks
      </Button>
      <Button href="/seasonpicks" onclick={close_drawer} color="surface" width="w-full" shadow>
        Season Picks
      </Button>
      <Button href="/leaderboard" onclick={close_drawer} color="surface" width="w-full" shadow>
        Leaderboard
      </Button>
      <Button href="/statistics" onclick={close_drawer} color="surface" width="w-full" shadow>
        Statistics
      </Button>
      <Button href="/rules" onclick={close_drawer} color="surface" width="w-full" shadow>
        Rules
      </Button>
    </div>
  {:else if $drawerStore.id === "data_drawer"}
    <!-- Data Drawer -->
    <!-- Data Drawer -->
    <!-- Data Drawer -->
    <div class="flex flex-col gap-2 p-2 pt-3">
      <Button href="/data/raceresults" onclick={close_drawer} color="surface" width="w-full" shadow>
        Race Results
      </Button>
      <Button
        href="/data/season/teams"
        onclick={close_drawer}
        color="surface"
        width="w-full"
        shadow
      >
        Season
      </Button>
      <Button href="/data/users" onclick={close_drawer} color="surface" width="w-full" shadow>
        Users
      </Button>
    </div>
  {:else if $drawerStore.id === "login_drawer"}
    <!-- Login Drawer -->
    <!-- Login Drawer -->
    <!-- Login Drawer -->
    <div class="flex flex-col gap-2 p-2 pt-3">
      <div class="flex">
        <h4 class="h4 select-none text-nowrap align-middle font-bold" style="line-height: 32px;">
          Login or Register
        </h4>
        <div class="w-full"></div>
        <div class="flex gap-2">
          <span class="align-middle" style="line-height: 32px;">Login</span>
          <SlideToggle
            name="registrationmode"
            background="bg-tertiary-500"
            active="bg-tertiary-500"
            bind:checked={registration_mode}
          />
          <span class="align-middle" style="line-height: 32px;">Register</span>
        </div>
      </div>
      <Input
        bind:value={username_value}
        placeholder="Username"
        autocomplete="username"
        minlength={3}
        maxlength={10}
        required
        onkeypress={enter_handler}
      >
        <UserIcon />
      </Input>
      <div
        class="{registration_mode
          ? ''
          : 'mt-[-8px] h-0'} overflow-hidden transition-all duration-150 ease-out"
      >
        <Input
          bind:value={firstname_value}
          placeholder="First Name"
          autocomplete="off"
          tabindex={registration_mode ? 0 : -1}
          onkeypress={enter_handler}
        >
          <NameIcon />
        </Input>
      </div>
      <div
        class="{registration_mode
          ? ''
          : 'mt-[-8px] h-0'} overflow-hidden transition-all duration-150 ease-out"
      >
        <Input
          id="login_email"
          type="email"
          bind:value={email_value}
          placeholder="E-Mail"
          autocomplete="email"
          tabindex={registration_mode ? 0 : -1}
          onkeypress={enter_handler}
        >
          <EMailIcon />
        </Input>
      </div>
      <Input
        id="login_password"
        bind:value={password_value}
        type="password"
        placeholder="Password"
        autocomplete="off"
        required
        onkeypress={enter_handler}
      >
        <PasswordIcon />
      </Input>
      <div
        class="{!registration_mode
          ? ''
          : 'mt-[-8px] h-0'} w-full overflow-hidden transition-all duration-150 ease-out"
      >
        <Button onclick={login} color="tertiary" width="w-full" shadow>Login</Button>
      </div>
      <div
        class="{registration_mode
          ? ''
          : 'mt-[-8px] h-0'} w-full overflow-hidden transition-all duration-150 ease-out"
      >
        <Button onclick={update_profile(true)} color="tertiary" width="w-full" shadow>
          Register
        </Button>
      </div>
    </div>
  {:else if $drawerStore.id === "profile_drawer" && pbUser}
    <!-- Profile Drawer -->
    <!-- Profile Drawer -->
    <!-- Profile Drawer -->
    <div class="flex flex-col gap-2 p-2 pt-3">
      <h4 class="h4 select-none align-middle font-bold" style="line-height: 32px;">Edit Profile</h4>
      <Input
        bind:value={username_value}
        maxlength={10}
        placeholder="Username"
        autocomplete="username"
      >
        <UserIcon />
      </Input>
      <Input bind:value={firstname_value} placeholder="First Name" autocomplete="off">
        <NameIcon />
      </Input>
      <Input bind:value={email_value} placeholder="E-Mail" autocomplete="email">
        <EMailIcon />
        {#snippet tail()}
          {#if $pbUser}
            <div
              class="input-group-shim select-none text-nowrap border-l text-neutral-900
              {$pbUser.verified ? 'bg-tertiary-500' : 'bg-primary-500'}"
            >
              {$pbUser.verified ? "Verified" : "Not Verified"}
            </div>
          {/if}
        {/snippet}
      </Input>
      <FileDropzone
        name="avatar"
        bind:files={avatar_value}
        onchange={get_avatar_preview_event_handler("user_avatar_preview")}
      >
        <svelte:fragment slot="message">
          <span class="font-bold">Upload Avatar</span>
        </svelte:fragment>
      </FileDropzone>
      <div class="flex justify-end gap-2">
        <Button onclick={update_profile()} color="secondary" width="w-full" shadow>
          Save Changes
        </Button>
        <Button onclick={logout} color="primary" width="w-full" shadow>Logout</Button>
      </div>
    </div>
  {/if}
</Drawer>

<nav>
  <div class="fixed left-0 right-0 top-0 z-40">
    <AppBar
      slotDefault="place-self-center"
      slotTrail="place-content-end"
      background="bg-primary-500"
      shadow="shadow"
      padding="p-2"
    >
      <svelte:fragment slot="lead">
        <div class="flex gap-2">
          <!-- Navigation drawer -->
          <div class="lg:hidden">
            <Button color="primary" onclick={menu_drawer}>
              <MenuDrawerIcon />
            </Button>
          </div>

          <!-- Site logo -->
          <Button href="/racepicks" color="primary">
            <span class="text-xl font-bold">Formula 11</span>
          </Button>
        </div>
      </svelte:fragment>

      <!-- Large navigation -->
      <div class="hidden gap-2 pr-8 lg:flex">
        <Button href="/racepicks" color="primary" activate_href>Race Picks</Button>
        <Button href="/seasonpicks" color="primary" activate_href>Season Picks</Button>
        <Button href="/leaderboard" color="primary" activate_href>Leaderboard</Button>
        <Button href="/statistics" color="primary" activate_href>Statistics</Button>
        <Button href="/rules" color="primary" activate_href>Rules</Button>
      </div>

      <svelte:fragment slot="trail">
        <div class="flex gap-2">
          <!-- Data drawer -->
          <Button
            color="primary"
            onclick={data_drawer}
            activate={$page.url.pathname.startsWith("/data")}>Data</Button
          >

          {#if !$pbUser}
            <!-- Login drawer -->
            <Button color="primary" onclick={login_drawer}>Login</Button>
          {:else}
            <!-- Profile drawer -->
            <Avatar
              id="user_avatar_preview"
              src={$pbUser?.avatar_url}
              rounded="rounded-full"
              width="w-10"
              background="bg-primary-50"
              onclick={profile_drawer}
              cursor="cursor-pointer"
            />
          {/if}
        </div>
      </svelte:fragment>
    </AppBar>
  </div>
</nav>

<!-- Each child's contents will be inserted here -->
<div class="p-2" style="margin-top: 60px;">
  {@render children()}
</div>
