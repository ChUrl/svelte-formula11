import Pocketbase, { type RecordModel, type RecordSubscription } from "pocketbase";
import type { Graphic, User } from "$lib/schema";
import { env } from "$env/dynamic/public";
import { invalidate } from "$app/navigation";
import { get, writable, type Writable } from "svelte/store";

export let pb = new Pocketbase(env.PUBLIC_PBURL || "http://192.168.86.50:8090");

// Keep this in a writable store, because this is basically a $state.
// We can't use $state in non-component files though.
export let pbUser: Writable<User | undefined> = writable(undefined);

const update_user = async (record: RecordModel): Promise<void> => {
  let avatar_url: string;
  if (record.avatar) {
    avatar_url = pb.files.getURL(record, record.avatar);
  } else {
    const driver_headshot_template: Graphic = await pb
      .collection("graphics")
      .getFirstListItem('name="driver_headshot_template"');
    avatar_url = pb.files.getURL(driver_headshot_template, driver_headshot_template.file);
  }

  pbUser.set({
    id: record.id,
    verified: record.verified,
    username: record.username,
    firstname: record.firstname,
    email: record.email ?? "",
    avatar: record.avatar,
    avatar_url: avatar_url,
    admin: record.admin,
  } as User);
};

// Update the pbUser object when authStore changes (e.g. after logging in)
pb.authStore.onChange(async () => {
  if (!pb.authStore.isValid) {
    console.log("pb.authStore is invalid: Setting pbUser to undefined");
    pbUser.set(undefined);
    return;
  }
  if (!pb.authStore.record) {
    console.log("pb.authStore.record is null: Setting pbUser to undefined");
    pbUser.set(undefined);
    return;
  }

  await update_user(pb.authStore.record);

  console.log("Updating pbUser...");
  console.dir(get(pbUser), { depth: null });
}, true);

export const clear_auth = (): void => {
  console.log("Cleared pb.authStore");
  pb.authStore.clear();
};

export const refresh_auth = async (): Promise<void> => {
  if (pb.authStore.isValid) {
    console.log("Refreshed pb.authStore");
    await pb.collection("users").authRefresh();
  } else {
    console.log("pb.autStore is invalid: Did not refresh pb.authStore");
    pb.authStore.clear();
  }
};

/**
 * Subscribe to PocketBase realtime collections
 */
export const subscribe = (collections: string[]) => {
  collections.forEach((collection: string) => {
    pb.collection(collection).subscribe("*", (event: RecordSubscription<RecordModel>) => {
      invalidate(`data:${collection}`);
    });
  });
};

/**
 * Unsubscribe from PocketBase realtime collections
 */
export const unsubscribe = (collections: string[]) => {
  collections.forEach((collection: string) => {
    pb.collection(collection).unsubscribe("*");
  });
};
