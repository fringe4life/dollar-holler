/**
 * Alchemy deploy graph for the SvelteKit Worker.
 *
 * `bun run alchemy:deploy` is
 * `bun x varlock run -- bun x alchemy deploy --stage dev` (no PATH
 * `varlock`). Varlock resolves `.env.schema` into `process.env`. The
 * `env` block below binds those values on the Worker (`Config.Redacted`
 * → `secret_text`, `Config.String` → plain text). There is no
 * `__VARLOCK_ENV` binding: Varlock does not yet build one for
 * non-Wrangler deploys (https://github.com/dmno-dev/varlock/issues/735).
 *
 * Worker physical name is `dollar-holler`. Alchemy manages exactly one
 * D1: logical `Database`, Cloudflare name `dolla-holla`. `Website.env.DB`
 * binds that resource. There is no second D1 named `dollar-holler` or
 * `dollar-hollar`, no `AdoptPolicy`, and no UUID adopt of
 * `LIVE_PRODUCTION_D1_UUID`. First live apply (not this PR) provisions
 * named D1 `dolla-holla`. Leftover empty Cloudflare D1s are out of this
 * graph. No custom domain (`dolla-holla.org` is not attached).
 *
 * Local `alchemy dev` / `db:migrate` use the local provider and persist
 * under `.alchemy/local/d1`. They do not call Cloudflare.
 *
 * `Alchemy.localState()` avoids bootstrapping the account Worker
 * `alchemy-state-store`. Stages `prod` and `production` are refused.
 */
import * as Cloudflare from "@alchemy.run/cloudflare";
import * as Alchemy from "alchemy";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";

const FORBIDDEN_STAGES = new Set(["prod", "production"]);

/**
 * Newest compatibility date this install documents.
 * Local Alchemy workerd here supports through `2026-11-02`. Alchemy's own
 * default is `2026-08-31`. Was `2026-08-14` in wrangler.jsonc.
 *
 * `nodejs_compat` is default-on for dates on or after `2026-08-04`
 * (`NODEJS_COMPAT_DEFAULT_ON`). Alchemy's `withDefaultFlags` does not send
 * the flag after that date because Cloudflare rejects the redundant flag.
 * The SvelteKit resource comment says `getCompatibility` adds it; that
 * addition only happens before the cutoff. Tooling still sees the flag via
 * `getToolingCompatibility`.
 */
export const COMPATIBILITY_DATE = "2026-11-02";

/** Worker and Alchemy stack name. Not the Cloudflare D1 name. */
export const APP_NAME = "dollar-holler";

/** Cloudflare D1 name. The only D1 resource Alchemy declares. */
export const D1_NAME = "dolla-holla";

/** Flattened SQL from `scripts/flatten-d1-migrations.ts`. Applied on Alchemy deploy and local Database reconcile. */
export const D1_MIGRATIONS_DIR = "src/lib/server/db/d1";

/**
 * Leftover pre-Alchemy live D1 UUID. Not passed on the Database
 * resource. Local and remote CLI still refuse it.
 */
export const LIVE_PRODUCTION_D1_UUID = "08d44dec-3fb0-4ddc-bd6e-9d0b8aa8a185";

/**
 * App D1 `dolla-holla`. Local `alchemy dev` uses the local provider
 * (persist under `.alchemy/local/d1`). First live apply (not this PR)
 * provisions the named database. No adopt, no UUID.
 */
export const Database = Cloudflare.D1.Database("Database", {
  name: D1_NAME,
  migrations: D1_MIGRATIONS_DIR,
});

/**
 * SvelteKit site. Compatibility date is `COMPATIBILITY_DATE`. No explicit
 * `nodejs_compat` flag (default-on at this date).
 * `BITWARDEN_ACCESS_TOKEN` is secret-zero for Varlock on the deploy
 * machine and is not a Worker binding. No `dolla-holla.org` route.
 * Worker `dollar-holler` stays that physical name. `env.DB` is Database.
 * Domain is still not attached.
 */
export const Website = Cloudflare.Website.SvelteKit("Website", {
  name: APP_NAME,
  workersDev: false,
  dev: {
    host: "127.0.0.1",
    port: 5173,
  },
  compatibility: {
    date: COMPATIBILITY_DATE,
  },
  env: {
    DB: Database,
    BETTER_AUTH_SECRET: Config.Redacted("BETTER_AUTH_SECRET"),
    OGYGIA_SECRET: Config.Redacted("OGYGIA_SECRET"),
    SENTRY_AUTH_TOKEN: Config.Redacted("SENTRY_AUTH_TOKEN"),
    PUBLIC_BASE_URL: Config.String("PUBLIC_BASE_URL"),
    ORIGIN: Config.String("ORIGIN"),
    VARLOCK_ENV: Config.String("VARLOCK_ENV"),
  },
});

export type WebsiteEnv = Cloudflare.InferEnv<typeof Website>;

export default Alchemy.Stack(
  APP_NAME,
  {
    providers: Cloudflare.providers(),
    state: Alchemy.localState(),
  },
  Effect.gen(function* () {
    const stage = yield* Alchemy.Stage;
    if (FORBIDDEN_STAGES.has(stage)) {
      return yield* Effect.die(
        new Error(
          `alchemy stack refuses stage "${stage}". Deploy with --stage dev. Worker name stays ${APP_NAME}; D1 name stays ${D1_NAME}.`
        )
      );
    }
    const site = yield* Website;
    return { url: site.url };
  })
);
