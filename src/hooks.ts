import type { Reroute } from "@sveltejs/kit";

const rerouted: Record<string, string> = {};

// NOTE: This does not change the browser's address bar (the route path)!
export const reroute: Reroute = ({ url }) => {
  if (url.pathname in rerouted) {
    return rerouted[url.pathname];
  }
};
