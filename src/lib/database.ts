/**
 * Select an element from an [objects] array where [key] matches [value].
 * Supposed to be used on collections returned by the [PocketBase] client.
 */
export const get_by_value = <T extends object>(
  objects: T[],
  key: keyof T,
  value: string,
): T | undefined => {
  return objects.find((o: T) => (key in o ? o[key] === value : false));
};
