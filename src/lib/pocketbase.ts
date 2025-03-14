import Pocketbase, { type RecordModel, type RecordSubscription } from "pocketbase";
import type { Graphic, User } from "$lib/schema";
import { env } from "$env/dynamic/public";
import { invalidate } from "$app/navigation";

export let pb = new Pocketbase(env.PUBLIC_PBURL || "http://192.168.86.50:8090");
export let pbUser: User | undefined = undefined;

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

  pbUser = {
    id: record.id,
    username: record.username,
    firstname: record.firstname,
    email: record.email ?? "",
    avatar: record.avatar,
    avatar_url: avatar_url,
    admin: record.admin,
  } as User;
};

// Update the pbUser object when authStore changes (e.g. after logging in)
pb.authStore.onChange(async () => {
  if (!pb.authStore.isValid) {
    console.log("pb.authStore is invalid: Setting pbUser to undefined");
    pbUser = undefined;
    return;
  }
  if (!pb.authStore.record) {
    console.log("pb.authStore.record is null: Setting pbUser to undefined");
    pbUser = undefined;
    return;
  }

  await update_user(pb.authStore.record);

  // TODO: If the user has not chosen an avatar,
  //       the page keeps displaying the "Login" button (wtf)
  console.log("Updating pbUser...");
  console.dir(pbUser, { depth: null });
}, true);

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
