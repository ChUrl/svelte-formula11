import type { Graphic, User } from "$lib/schema";
import type { Handle } from "@sveltejs/kit";
import PocketBase from "pocketbase";

// This function will run serverside on each request.
// The event.locals will be passed onto serverside load functions and handlers.
// We create a new PocketBase client for each request, so it always carries the
// most recent authentication data.
// The authenticated PocketBase client will be available in all *.server.ts files.
export const handle: Handle = async ({ event, resolve }) => {
  const requestStartTime: number = Date.now();

  event.locals.pb = new PocketBase("http://192.168.86.50:8090");

  // Load the most recent authentication data from a cookie (is updated below)
  event.locals.pb.authStore.loadFromCookie(event.request.headers.get("cookie") || "");

  if (event.locals.pb.authStore.isValid) {
    // If the authentication data is valid, we make a "user" object easily available.
    event.locals.user = structuredClone(event.locals.pb.authStore.model) as User;

    if (event.locals.user) {
      if (event.locals.pb.authStore.model.avatar) {
        // Fill in the avatar URL
        event.locals.user.avatar_url = event.locals.pb.files.getURL(
          event.locals.pb.authStore.model,
          event.locals.pb.authStore.model.avatar,
        );
      } else {
        // Fill in the driver_headshot_template URL if no avatar chosen
        const driver_headshot_template: Graphic = await event.locals.pb
          .collection("graphics")
          .getFirstListItem('name="driver_headshot_template"');
        event.locals.user.avatar_url = event.locals.pb.files.getURL(
          driver_headshot_template,
          driver_headshot_template.file,
        );
      }

      // Set admin status for easier access
      event.locals.admin = event.locals.user.admin;
    }
  } else {
    event.locals.user = undefined;
  }

  // Resolve the request. This is what happens by default.
  const response = await resolve(event);

  console.log(
    "=====\n",
    `Request Date: ${new Date(requestStartTime).toISOString()}\n`,
    `Method: ${event.request.method}\n`,
    `Path: ${event.url.pathname}\n`,
    `Duration: ${Date.now() - requestStartTime}ms\n`,
    `Status: ${response.status}`,
  );

  // Store the current authentication data to a cookie, so it can be loaded above.
  response.headers.set("set-cookie", event.locals.pb.authStore.exportToCookie({ secure: false }));

  return response;
};
