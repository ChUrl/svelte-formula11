<script lang="ts">
  import "../app.css";

  import type { Snippet } from "svelte";
  import type { LayoutData } from "./$types";
  import { page } from "$app/stores";

  import { Button, MenuDrawerIcon, UserIcon, Input, PasswordIcon, Card } from "$lib/components";
  import { get_avatar_preview_event_handler, get_image_preview_event_handler } from "$lib/image";

  import {
    AppBar,
    popup,
    storePopup,
    type PopupSettings,
    initializeStores,
    Drawer,
    getDrawerStore,
    type DrawerSettings,
    Avatar,
    FileDropzone,
    type DrawerStore,
  } from "@skeletonlabs/skeleton";
  import { computePosition, autoUpdate, offset, shift, flip, arrow } from "@floating-ui/dom";

  let { data, children }: { data: LayoutData; children: Snippet } = $props();

  // Drawer config
  initializeStores();
  const drawerStore: DrawerStore = getDrawerStore();

  const drawer_settings_base: DrawerSettings = {
    position: "top",
    height: "auto",
    padding: "lg:px-96",
    bgDrawer: "bg-surface-100",
  };

  const menu_drawer = () => {
    const drawerSettings: DrawerSettings = {
      id: "menu_drawer",
      ...drawer_settings_base,
    };
    drawerStore.open(drawerSettings);
  };

  const data_drawer = () => {
    const drawerSettings: DrawerSettings = {
      id: "data_drawer",
      ...drawer_settings_base,
    };
    drawerStore.open(drawerSettings);
  };

  const login_drawer = () => {
    const drawerSettings: DrawerSettings = {
      id: "login_drawer",
      ...drawer_settings_base,
    };
    drawerStore.open(drawerSettings);
  };

  const profile_drawer = () => {
    const drawerSettings: DrawerSettings = {
      id: "profile_drawer",
      ...drawer_settings_base,
    };
    drawerStore.open(drawerSettings);
  };

  const close_drawer = () => drawerStore.close();

  // Popups config
  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

  // Example: https://www.skeleton.dev/utilities/popups
  // const data_popup_settings: PopupSettings = {
  //   event: "click",
  //   target: "data_popup",
  //   placement: "bottom",
  //   middleware: {
  //     offset: { mainAxis: 22, crossAxis: 0 },
  //     // shift: { mainAxis: true, crossAxis: false },
  //   },
  // };
</script>

<Drawer>
  {#if $drawerStore.id === "menu_drawer"}
    <!-- Menu Drawer -->
    <!-- Menu Drawer -->
    <!-- Menu Drawer -->
    <div class="flex flex-col gap-2 p-2">
      <Button href="/racepicks" onclick={close_drawer} color="surface" fullwidth>Race Picks</Button>
      <Button href="/seasonpicks" onclick={close_drawer} color="surface" fullwidth
        >Season Picks
      </Button>
      <Button href="/leaderboard" onclick={close_drawer} color="surface" fullwidth
        >Leaderboard
      </Button>
      <Button href="/statistics" onclick={close_drawer} color="surface" fullwidth
        >Statistics
      </Button>
      <Button href="/rules" onclick={close_drawer} color="surface" fullwidth>Rules</Button>
    </div>
  {:else if $drawerStore.id === "data_drawer"}
    <!-- Data Drawer -->
    <!-- Data Drawer -->
    <!-- Data Drawer -->
    <div class="flex flex-col gap-2 p-2">
      <Button href="/data/season" onclick={close_drawer} color="surface" fullwidth>Season</Button>
      <Button href="/data/user" onclick={close_drawer} color="surface" fullwidth>Users</Button>
    </div>
  {:else if $drawerStore.id === "login_drawer"}
    <!-- Login Drawer -->
    <!-- Login Drawer -->
    <!-- Login Drawer -->
    <div class="flex flex-col gap-2 p-2">
      <h4 class="h4 select-none">Enter Username and Password</h4>
      <form method="POST" class="contents">
        <Input name="username" placeholder="Username" required>
          <UserIcon />
        </Input>
        <Input name="password" type="password" placeholder="Password" required
          ><PasswordIcon />
        </Input>
        <div class="flex justify-end gap-2">
          <Button formaction="/profile?/login" onclick={close_drawer} color="tertiary" submit
            >Login</Button
          >
          <Button
            formaction="/profile?/create_profile"
            onclick={close_drawer}
            color="tertiary"
            submit>Register</Button
          >
        </div>
      </form>
    </div>
  {:else if $drawerStore.id === "profile_drawer" && data.user}
    <!-- Profile Drawer -->
    <!-- Profile Drawer -->
    <!-- Profile Drawer -->
    <div class="flex flex-col gap-2 p-2">
      <h4 class="h4 select-none">Edit Profile</h4>
      <form method="POST" enctype="multipart/form-data" class="contents">
        <input type="hidden" name="id" value={data.user.id} />
        <Input name="username" value={data.user.username} placeholder="Username"><UserIcon /></Input
        >
        <FileDropzone
          name="avatar"
          onchange={get_avatar_preview_event_handler("user_avatar_preview")}
        >
          <svelte:fragment slot="message"><b>Upload Avatar</b> or Drag and Drop</svelte:fragment>
        </FileDropzone>
        <div class="flex justify-end gap-2">
          <Button
            formaction="/profile?/update_profile"
            onclick={close_drawer}
            color="secondary"
            submit>Save Changes</Button
          >
          <Button formaction="/profile?/logout" onclick={close_drawer} color="primary" submit
            >Logout</Button
          >
        </div>
      </form>
    </div>
  {/if}
</Drawer>

<nav>
  <!-- TODO: Make this stick to the top somehow (fixed/sticky). -->
  <AppBar
    slotDefault="place-self-center"
    slotTrail="place-content-end"
    background="bg-primary-500"
    shadow="shadow"
    padding="p-2"
  >
    <svelte:fragment slot="lead">
      <!-- Navigation drawer -->
      <div class="lg:hidden">
        <Button color="primary" onclick={menu_drawer}>
          <MenuDrawerIcon />
        </Button>
      </div>

      <!-- Site logo -->
      <div class="ml-2 lg:ml-0">
        <Button href="/" color="primary"><span class="text-xl font-bold">Formula 11</span></Button>
      </div>
    </svelte:fragment>

    <!-- Large navigation -->
    <div class="hidden gap-2 lg:flex">
      <Button href="/racepicks" color="primary" activate_href>Race Picks</Button>
      <Button href="/seasonpicks" color="primary" activate_href>Season Picks</Button>
      <Button href="/leaderboard" color="primary" activate_href>Leaderboard</Button>
      <Button href="/statistics" color="primary" activate_href>Statistics</Button>
      <Button href="/rules" color="primary" activate_href>Rules</Button>
    </div>

    <svelte:fragment slot="trail">
      <!-- Data drawer -->
      <Button
        color="primary"
        onclick={data_drawer}
        activate={$page.url.pathname.startsWith("/data")}>Data</Button
      >

      <!-- Login/Profile drawer -->
      {#if !data.user}
        <Button color="primary" onclick={login_drawer}>Login</Button>
      {:else}
        <Avatar
          id="user_avatar_preview"
          src={data.user.avatar_url}
          rounded="rounded-full"
          width="w-10"
          onclick={profile_drawer}
          cursor="cursor-pointer"
        />
      {/if}
    </svelte:fragment>
  </AppBar>
</nav>

<!-- Each child's contents will be inserted here -->
<div class="p-2">
  {@render children()}
</div>
