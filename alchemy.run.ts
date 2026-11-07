/**
 * Unapplied Alchemy v2 declaration of this app's Cloudflare shape.
 *
 * Nothing in this file runs unless an Alchemy command executes the stack.
 * `bun run alchemy:plan` executes it with local providers and stops before
 * apply. Do not run `alchemy deploy`.
 *
 * Physical names are spike-only. `Cloudflare.D1.Database` on
 * `@alchemy.run/cloudflare@2.0.0-beta.85` always creates a database: there
 * is no adopt-off or "existing database_id" prop (`clone` copies a source
 * into a new database; `Resource.ref` reads a database Alchemy already
 * deployed). The live D1 name `dollar-holler` and Worker `dollar-holler`
 * are intentionally not used. The custom domain is omitted.
 */
import * as Cloudflare from "@alchemy.run/cloudflare";
import * as Alchemy from "alchemy";
import * as Effect from "effect/Effect";

/** Not the production database `dollar-holler`. Not applied. */
export const Database = Cloudflare.D1.Database("Database", {
  name: "dollar-holler-alchemy-spike",
});

/**
 * SvelteKit site. `nodejs_compat` is explicit because this compatibility
 * date is after Alchemy's default-on cutoff (`2026-08-04`): `withDefaultFlags`
 * does not inject the flag for later dates. No `domain` and no `routes`.
 */
export const Website = Cloudflare.Website.SvelteKit("Website", {
  name: "dollar-holler-alchemy-spike",
  workersDev: false,
  compatibility: {
    date: "2026-08-14",
    flags: ["nodejs_compat"],
  },
  env: {
    DB: Database,
  },
});

export type WebsiteEnv = Cloudflare.InferEnv<typeof Website>;

export default Alchemy.Stack(
  "dollar-holler-alchemy-spike",
  {
    providers: Cloudflare.providers(),
    // `Cloudflare.state()` bootstraps the account Worker `alchemy-state-store`
    // (and calls the Cloudflare API) the first time a plan loads state.
    // Local state keeps this unapplied spike off that path.
    state: Alchemy.localState(),
  },
  Effect.gen(function* () {
    const site = yield* Website;
    return { url: site.url };
  })
);
