/**
 * Retrieve an arbitrary object with a matching ID from an Array.
 * Supposed to be used on collections returned by the PocketBase API.
 */
export const get_by_id = <T extends object>(objects: T[], id: string): T | undefined => {
  return objects.find((o: T) => ("id" in o ? o.id === id : false));
};
