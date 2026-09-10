declare namespace Cloudflare {
  interface Env {
    DB: import("@cloudflare/workers-types").D1Database;
  }
}

declare module "cloudflare:workers" {
  export const env: Cloudflare.Env;
  export function waitUntil(promise: Promise<unknown>): void;
}
