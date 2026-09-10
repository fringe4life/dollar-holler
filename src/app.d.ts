import "@sveltejs/enhanced-img";
import type { User } from "better-auth";
import type { Maybe } from "#lib/types.ts";

declare global {
  // biome-ignore lint/style/noNamespace: svelte-kit
  namespace App {
    // interface Error {}
    interface Locals {
      user: Maybe<User>;
    }
    interface PageData {
      user: Maybe<User>;
    }
    // interface PageState {}
  }
}

export {};
