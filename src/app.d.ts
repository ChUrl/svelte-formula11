import type { User } from "$lib/schema";
import type { PocketBase, RecordModel } from "pocketbase";

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    interface Locals {
      pb: PocketBase;
      user: User | undefined;
      admin: boolean;
    }

    // interface Error {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
