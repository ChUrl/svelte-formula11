/**
 * Retrieve an arbitrary object with a matching ID from an Array.
 * Supposed to use on collections returned by the PocketBase API.
 */
export const get_by_id = <T extends object>(objects: Array<T>, id: string): T | undefined => {
  return objects.find((o: T) => ("id" in o ? o.id === id : false));
};
