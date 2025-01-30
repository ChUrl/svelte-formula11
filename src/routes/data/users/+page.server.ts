import type { Graphic, User } from "$lib/schema";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, locals }) => {
  const fetch_users = async (): Promise<User[]> => {
    const users: User[] = await locals.pb
      .collection("users")
      .getFullList({ fetch: fetch, sort: "+username" });

    users.map((user: User) => {
      user.avatar_url = locals.pb.files.getURL(user, user.avatar);
    });

    return users;
  };

  // TODO: Duplicated code from data/season/+layout.server.ts + racepicks/+page.server.ts
  const fetch_graphics = async (): Promise<Graphic[]> => {
    const graphics: Graphic[] = await locals.pb
      .collection("graphics")
      .getFullList({ fetch: fetch });

    graphics.map((graphic: Graphic) => {
      graphic.file_url = locals.pb.files.getURL(graphic, graphic.file);
    });

    return graphics;
  };

  return {
    users: await fetch_users(),
    graphics: await fetch_graphics(),
  };
};
