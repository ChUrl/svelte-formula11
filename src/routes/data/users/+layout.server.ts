import type { User } from "$lib/schema";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch, locals }) => {
  const fetch_users = async (): Promise<User[]> => {
    const users: User[] = await locals.pb
      .collection("users")
      .getFullList({ fetch: fetch, sort: "+username" });

    users.map((user: User) => {
      user.avatar_url = locals.pb.files.getURL(user, user.avatar);
    });

    return users;
  };

  return {
    users: await fetch_users(),
  };
};
