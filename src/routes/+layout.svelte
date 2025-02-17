<script lang="ts">
  import "../app.css";
  import type { Snippet } from "svelte";
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
  } from "@skeletonlabs/skeleton";
  import { computePosition, autoUpdate, offset, shift, flip, arrow } from "@floating-ui/dom";
  import { invalidateAll } from "$app/navigation";
  import { get_error_toast } from "$lib/toast";
  import { pb } from "$lib/pocketbase";
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
  let username_value: string = $state("");
  let firstname_value: string = $state("");
  let password_value: string = $state("");
  let avatar_value: FileList | undefined = $state();

  // Database actions
  const login = async (): Promise<void> => {
    try {
      await pb.collection("users").authWithPassword(username_value, password_value);
    } catch (error) {
      toastStore.trigger(get_error_toast("" + error));
    }
    await invalidateAll();
    drawerStore.close();
    password_value = "";
    firstname_value = data.user?.firstname ?? "";
  };

  const logout = async (): Promise<void> => {
    pb.authStore.clear();
    await invalidateAll();
    drawerStore.close();
    username_value = "";
    firstname_value = "";
    password_value = "";
  };

  const update_profile = (create?: boolean): (() => Promise<void>) => {
    const handler = async (): Promise<void> => {
      if (!username_value || username_value === "") {
        toastStore.trigger(get_error_toast("Please enter a username!"));
        return;
      }
      if (!firstname_value || firstname_value === "") {
        toastStore.trigger(get_error_toast("Please enter your first name!"));
        return;
      }
      if (!password_value || password_value === "") {
        toastStore.trigger(get_error_toast("Please enter a password!"));
        return;
      }

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
          await pb.collection("users").create({
            username: username_value,
            firstname: firstname_value,
            password: password_value,
            passwordConfirm: password_value,
            admin: false,
          });

          await login();
          return;
        } else {
          if (!data.user?.id || data.user.id === "") {
            toastStore.trigger(get_error_toast("Invalid user id!"));
            return;
          }

          await pb.collection("users").update(data.user.id, {
            username: username_value,
            firstname: firstname_value,
            avatar: avatar_avif,
          });

          invalidateAll();
          drawerStore.close();
        }
      } catch (error) {
        toastStore.trigger(get_error_toast("" + error));
      }
    };

    return handler;
  };
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
      <h4 class="h4 select-none">Enter Username and Password</h4>
      <Input bind:value={username_value} placeholder="Username" autocomplete="username" required>
        <UserIcon />
      </Input>
      <Input
        bind:value={firstname_value}
        placeholder="First Name (leave empty for login)"
        autocomplete="off"
      >
        <NameIcon />
      </Input>
      <Input
        bind:value={password_value}
        type="password"
        placeholder="Password"
        autocomplete="off"
        required
      >
        <PasswordIcon />
      </Input>
      <div class="flex justify-end gap-2">
        <Button onclick={login} color="tertiary" shadow>Login</Button>
        <Button onclick={update_profile(true)} color="tertiary" shadow>Register</Button>
      </div>
    </div>
  {:else if $drawerStore.id === "profile_drawer" && data.user}
    <!-- Profile Drawer -->
    <!-- Profile Drawer -->
    <!-- Profile Drawer -->
    <div class="flex flex-col gap-2 p-2 pt-3">
      <h4 class="h4 select-none">Edit Profile</h4>
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
        <Button onclick={update_profile()} color="secondary" shadow>Save Changes</Button>
        <Button onclick={logout} color="primary" shadow>Logout</Button>
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

          {#if !data.user}
            <!-- Login drawer -->
            <Button color="primary" onclick={login_drawer}>Login</Button>
          {:else}
            <!-- Profile drawer -->
            <Avatar
              id="user_avatar_preview"
              src={data.user.avatar_url}
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
