import type { D1Database } from "@cloudflare/workers-types";
import type { User } from "better-auth";
import type { Maybe } from "#lib/types";

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
    interface Platform {
      env: {
        DB: D1Database;
      };
    }
  }
}
