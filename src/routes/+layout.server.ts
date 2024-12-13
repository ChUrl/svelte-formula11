import type { LayoutServerLoad } from "./$types";

// On each page load (every route), this function runs serverside.
// The "locals.user" object is only available on the server,
// since it's populated inside hooks.server.ts per request.
// It will populate the "user" attribute of each page's "data" object,
// so each page has access to the current user (or knows if no one is signed in).
export const load: LayoutServerLoad = ({ locals }) => {
  if (locals.user) {
    return {
      user: locals.user,
      admin: locals.user.admin,
    };
  }

  return {
    user: undefined,
  };
};
