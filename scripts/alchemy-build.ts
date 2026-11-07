/**
 * Production build through Alchemy's SvelteKit integration.
 *
 * `vite build` alone has no adapter: `@sveltejs/adapter-cloudflare` is gone
 * and `sveltekit()` does not declare one. This runs the same `Framework.build`
 * Alchemy uses at deploy time, which injects
 * `@alchemy.run/frontend-frameworks/sveltekit` and writes client output under
 * `.svelte-kit/output/client` (what BundleWatch measures) plus
 * `.svelte-kit/cloudflare`.
 *
 * Varlock does not inject the Cloudflare SSR loader for this adapter. That
 * is the accepted `__VARLOCK_ENV` gap.
 *
 * This process is the Bun host (`bun run build`). `@effect/platform-bun` is
 * only the FileSystem/Path layer for that host. The deployed Worker is
 * workerd. `nodejs_compat` (default-on after 2026-08-04) is what Better Auth's
 * async local storage needs there. Do not import this file from the Worker.
 */
import { layer as BunServices } from "@effect/platform-bun/BunServices";
import { make } from "@alchemy.run/frontend-frameworks/sveltekit";
import * as Effect from "effect/Effect";
import { COMPATIBILITY_DATE } from "../alchemy.run.ts";

const output = await Effect.runPromise(
  Effect.gen(function* () {
    const framework = yield* make({
      compatibilityDate: COMPATIBILITY_DATE,
    });
    return yield* framework.build({});
  }).pipe(Effect.provide(BunServices))
);

const client =
  output !== null &&
  typeof output === "object" &&
  "clientDirectory" in output &&
  typeof output.clientDirectory === "string"
    ? output.clientDirectory
    : ".svelte-kit/output/client";
console.log(`alchemy sveltekit build wrote client output at ${client}`);
