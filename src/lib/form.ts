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
 * Remove empty fields and files from FormData objects.
 */
export const form_data_clean = (data: FormData): FormData => {
  for (const [key, value] of data.entries()) {
    if (value === "") {
      // Remove empty keys
      data.delete(key);
    } else if (
      // Remove empty files
      typeof value === "object" &&
      value !== null &&
      "size" in value &&
      value.size === 0
    ) {
      data.delete(key);
    }
  }

  return data;
};

/**
 * Throws SvelteKit error(400) if form_data does not contain key.
 */
export const form_data_ensure_key = (data: FormData, key: string) => {
  if (!data.get(key)) error(400, `Key "${key}" missing from form_data!`);
};

/**
 * Throws SvelteKit error(400) if form_data does not contain all keys.
 */
export const form_data_ensure_keys = (data: FormData, keys: string[]) => {
  keys.map((key) => form_data_ensure_key(data, key));
};