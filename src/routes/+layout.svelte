<script lang="ts">
  import "../app.css";
  import type { Snippet } from "svelte";
  import type { LayoutData } from "./$types";
  import { FileInput, Password, Username } from "$lib/components";
  import { get_image_preview_event_handler } from "$lib/image";

  let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<nav>
  <!-- TODO: Make this stick to the top somehow. -->
  <!--       Fixed breaks the flexbox and sticky doesn't work. -->
  <div class="navbar h-16 bg-primary shadow">
    <div class="navbar-start">
      <!-- Side menu be visible on low width devices -->
      <div class="dropdown">
        <!-- Side menu open/close icon -->
        <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h8m-8 6h16"
            />
          </svg>
        </div>

        <!-- Side menu navigation items -->
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <ul
          tabindex="0"
          class="menu dropdown-content z-[1] mt-4 w-52 rounded-box border bg-base-100 p-2 shadow"
        >
          <li><a href="/racepicks">Race Picks</a></li>
          <li><a href="/seasonpicks">Season Picks</a></li>
          <li><a href="/leaderboard">Leaderboard</a></li>
          <li><a href="/statistics">Statistics</a></li>
          <li><a href="/rules">Rules</a></li>
        </ul>
      </div>

      <!-- Site logo -->
      <a href="/" class="btn btn-ghost text-xl">Formula 11</a>
    </div>

    <!-- Centered navigation -->
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1">
        <li>
          <a class="btn btn-ghost btn-sm" href="/racepicks">Race Picks</a>
        </li>
        <li>
          <a class="btn btn-ghost btn-sm" href="/seasonpicks">Season Picks</a>
        </li>
        <li>
          <a class="btn btn-ghost btn-sm" href="/leaderboard">Leaderboard</a>
        </li>
        <li>
          <a class="btn btn-ghost btn-sm" href="/statistics">Statistics</a>
        </li>
        <li><a class="btn btn-ghost btn-sm" href="/rules">Rules</a></li>
      </ul>
    </div>

    <div class="navbar-end">
      <!-- Admin button -->
      <div class="dropdown dropdown-end mr-2">
        <div tabindex="0" role="button" class="btn btn-ghost">Admin</div>
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <ul
          tabindex="0"
          class="menu dropdown-content z-[1] mt-4 w-52 rounded-box border bg-base-100 p-2 shadow"
        >
          <li><a href="/admin/users">Users</a></li>
          <li><a href="/admin/seasondata/teams">Season Data</a></li>
          <li><a href="/admin/userdata">User Data</a></li>
        </ul>
      </div>

      <!-- Login/profile stuff -->
      {#if !data.user}
        <!-- No user is logged in  -->
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost m-1">Login</div>
          <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
          <div
            tabindex="0"
            class="menu dropdown-content z-[1] mt-4 w-[150] rounded-box border bg-base-100 p-2 shadow"
          >
            <h1 class="text-lg">Enter Username and Password</h1>
            <form method="POST">
              <Username id="signin_username" name="username" />
              <Password id="signin_password" name="password" />
              <div class="card-actions mt-2 justify-end">
                <button
                  formaction="/user?/create"
                  type="button"
                  class="btn btn-accent">Register</button
                >
                <button
                  formaction="/user?/login"
                  type="submit"
                  class="btn btn-accent">Login</button
                >
              </div>
            </form>
          </div>
        </div>
      {:else}
        <!-- The user is logged in -->
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="avatar ml-2 mr-2">
            <div class="mask mask-squircle w-10">
              <img
                id="user_avatar_preview"
                src={data.user.avatar_url}
                alt="User avatar"
              />
            </div>
          </div>
          <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
          <div
            tabindex="0"
            class="menu dropdown-content z-[1] mt-4 w-[150] rounded-box border bg-base-100 p-2 shadow"
          >
            <h1 class="text-lg">Edit Profile</h1>
            <form method="POST" enctype="multipart/form-data">
              <input type="hidden" name="id" value={data.user.id} />
              <Username
                id="update_username"
                name="username"
                value={data.user.username}
              />
              <FileInput
                id="update_avatar"
                name="avatar"
                label="Upload Avatar"
                onchange={get_image_preview_event_handler(
                  "user_avatar_preview",
                )}
              />
              <div class="card-actions mt-2 justify-end">
                <button formaction="/user?/update" class="btn btn-secondary"
                  >Save Changes</button
                >
                <button formaction="/user?/logout" class="btn btn-primary"
                  >Logout</button
                >
              </div>
            </form>
          </div>
        </div>
      {/if}
    </div>
  </div>
</nav>

<!-- Each child's contents will be inserted here -->
<div class="p-2">
  {@render children()}
</div>
