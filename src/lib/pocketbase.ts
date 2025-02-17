import Pocketbase, { type AuthRecord } from "pocketbase";
import type { Graphic, User } from "$lib/schema";
import { env } from "$env/dynamic/public";

export let pb = new Pocketbase(env.PUBLIC_PBURL || "http://192.168.86.50:8090");
export let pbUser: User | undefined = undefined;

const update_user = async (record: AuthRecord): Promise<void> => {
  if (!record) {
    pbUser = undefined;
    console.log("Returning with pbUser = undefined");
    return;
  }

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
    avatar: record.avatar,
    avatar_url: avatar_url,
    admin: record.admin,
  } as User;
};

// Update the pbUser object when authStore changes (e.g. after logging in)
pb.authStore.onChange(async () => {
  await update_user(pb.authStore.record);

  // TODO: If the user has not chosen an avatar,
  //       the page keeps displaying the "Login" button (wtf)
  console.log("Updating pbUser...");
  console.dir(pbUser, { depth: null });
}, true);
