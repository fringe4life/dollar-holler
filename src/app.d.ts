import type { Session, User } from "better-auth";
import type { Maybe } from "$lib/types";

declare global {
  // biome-ignore lint/style/noNamespace: svelte-kit
  namespace App {
    // interface Error {}
    interface Locals {
      session: Maybe<Session>;
      user: Maybe<User>;
    }
    interface PageData {
      session: Maybe<Session>;
      user: Maybe<User>;
    }
    // interface PageState {}
    // interface Platform {}
  }
}
