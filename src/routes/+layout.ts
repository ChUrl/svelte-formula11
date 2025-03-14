import { fetch_graphics } from "$lib/fetch";
import { pbUser } from "$lib/pocketbase";
import { get } from "svelte/store";
import type { LayoutLoad } from "./$types";
import type { User } from "$lib/schema";

// This makes the page client-side rendered
export const ssr = false;

// On each page load (every route), this function runs serverside.
// The "locals.user" object is only available on the server,
// since it's populated inside hooks.server.ts per request.
// It will populate the "user" attribute of each page's "data" object,
// so each page has access to the current user (or knows if no one is signed in).
export const load: LayoutLoad = async ({ fetch, depends }) => {
  depends("data:graphics");

  return {
    // NOTE: Don't do this! The user object will be updated after this, so it will be undefined!
    //
    // User information (synchronous)
    // user: get(pbUser),
    // admin: get(pbUser)?.admin ?? false,

    // Return static data
    graphics: await fetch_graphics(fetch),
  };
};
