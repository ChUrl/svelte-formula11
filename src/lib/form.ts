import { error } from "@sveltejs/kit";

/**
 * Obtain the value of the key "id" and remove it from the FormData.
 * Throws SvelteKit error(400) if "id" is not found.
 */
export const form_data_get_and_remove_id = (data: FormData): string => {
  const id: string | undefined = data.get("id")?.toString();
  if (!id) error(400, "Missing ID");
  data.delete("id");
  return id;
};

/**
 * Remove empty fields (even whitespace) and empty files from FormData objects.
 * Keys listed in [except] won't be removed although they are empty.
 */
export const form_data_clean = (data: FormData, except: string[] = []): FormData => {
  let delete_keys: string[] = [];

  for (const [key, value] of data.entries()) {
    if (
      !except.includes(key) &&
      (value === null ||
        value === undefined ||
        (typeof value === "string" && value.trim() === "") ||
        (typeof value === "object" && "size" in value && value.size === 0))
    ) {
      delete_keys.push(key);
    }
  }

  delete_keys.forEach((key) => {
    data.delete(key);
  });

  return data;
};

/**
 * Throws SvelteKit error(400) if form_data does not contain key.
 */
export const form_data_ensure_key = (data: FormData, key: string): void => {
  if (!data.get(key)) error(400, `Key "${key}" missing from form_data!`);
};

/**
 * Throws SvelteKit error(400) if form_data does not contain all keys.
 */
export const form_data_ensure_keys = (data: FormData, keys: string[]): void => {
  keys.map((key) => form_data_ensure_key(data, key));
};

/**
 * Modify a single [FormData] element to satisfy PocketBase's date format.
 * Date format: 2024-12-31 12:00:00.000Z
 */
export const form_data_fix_date = (data: FormData, key: string): boolean => {
  const value: string | undefined = data.get(key)?.toString();
  if (!value) return false;

  const date: string = new Date(value).toISOString();
  data.set(key, date);

  return true;
};

export const form_data_fix_dates = (data: FormData, keys: string[]): boolean[] => {
  return keys.map((key) => form_data_fix_date(data, key));
};
