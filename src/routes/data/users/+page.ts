import { pb } from "$lib/pocketbase";
import type { User } from "$lib/schema";
import type { PageLoad } from "../../$types";

export const load: PageLoad = async ({ fetch }) => {
  const fetch_users = async (): Promise<User[]> => {
    const users: User[] = await pb
      .collection("users")
      .getFullList({ fetch: fetch, sort: "+username" });

    users.map((user: User) => {
      user.avatar_url = pb.files.getURL(user, user.avatar);
    });

    return users;
  };

  return {
    users: await fetch_users(),
  };
};
