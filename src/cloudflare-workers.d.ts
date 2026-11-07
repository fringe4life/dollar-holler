/**
 * Worker bindings from `Cloudflare.InferEnv<typeof Website>` (`WebsiteEnv`
 * in `alchemy.run.ts`). This file stays a script (no top-level import) so
 * the ambient module exists. App D1 reads `platform.env.DB` (`App.Platform`
 * in `app.d.ts`); Alchemy's Worker shim still sources that from
 * `cloudflare:workers`.
 */
declare module "cloudflare:workers" {
  export const env: import("../alchemy.run.ts").WebsiteEnv;
  export function waitUntil(promise: Promise<unknown>): void;
}
