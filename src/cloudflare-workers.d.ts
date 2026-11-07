/**
 * Worker bindings from `Cloudflare.InferEnv<typeof Website>` (`WebsiteEnv`
 * in `alchemy.run.ts`). This file stays a script (no top-level import) so
 * the ambient module exists. D1 stays `import { env } from "cloudflare:workers"`.
 * Alchemy's shim also sets `platform.env` (`App.Platform` in `app.d.ts`).
 */
declare module "cloudflare:workers" {
  export const env: import("../alchemy.run.ts").WebsiteEnv;
  export function waitUntil(promise: Promise<unknown>): void;
}
