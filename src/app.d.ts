import type { Maybe } from "$lib/types";
import type { Session, User } from "better-auth";
declare global {
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
