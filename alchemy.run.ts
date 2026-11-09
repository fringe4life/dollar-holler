/**
 * Alchemy deploy graph for the SvelteKit Worker.
 *
 * `bun run deploy` is `varlock run -- bun x alchemy deploy --stage dev`.
 * Varlock resolves `.env.schema` into `process.env`. The `env` block below
 * binds those values on the Worker (`Config.Redacted` → `secret_text`,
 * `Config.String` → plain text). There is no `__VARLOCK_ENV` binding:
 * Varlock does not yet build one for non-Wrangler deploys
 * (https://github.com/dmno-dev/varlock/issues/735).
 *
 * Worker physical name is `dollar-holler`. Live D1 is preexisting
 * `dolla-holla` (`08d44dec-3fb0-4ddc-bd6e-9d0b8aa8a185`), adopted by
 * Cloudflare name on a new logical id (`DollaHolla`) so existing
 * `Database` state (empty `dollar-holler` D1) cannot block name lookup.
 * `Website.env.DB` binds `DollaHolla`. Neither D1 resource sets
 * `migrations:`. Both use `RemovalPolicy.retain()`. Logical `Database`
 * stays in the stack (name `dollar-holler`) so Alchemy does not orphan-
 * delete the empty D1. No custom domain (`dolla-holla.org` is not
 * attached).
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

/** Worker and Alchemy stack name. Not the live D1 name. */
export const APP_NAME = "dollar-holler";

/**
 * Cloudflare D1 name Alchemy adopts. Distinct from Worker `APP_NAME`.
 * Matches preexisting `dolla-holla` (`LIVE_PRODUCTION_D1_UUID`).
 */
export const D1_NAME = "dolla-holla";

/** Logical id for the live D1 resource (fresh adopt-by-name). */
export const DOLLA_HOLLA_LOGICAL_ID = "DollaHolla";

/**
 * Flattened SQL from `scripts/flatten-d1-migrations.ts`. Used by local
 * `db:migrate` scripts. Not passed on either D1 resource.
 */
export const D1_MIGRATIONS_DIR = "src/lib/server/db/d1";

/**
 * Preexisting live D1 UUID for `dolla-holla`. Not passed on the D1
 * resource (adopt is by Cloudflare name). Seed/migrate CLI still refuses it.
 */
export const LIVE_PRODUCTION_D1_UUID = "08d44dec-3fb0-4ddc-bd6e-9d0b8aa8a185";

/**
 * Empty D1 Alchemy already created as `dollar-holler`. Same logical id as
 * #302 state. Retain so it is not deleted when live data moves to
 * `DollaHolla`. No `migrations:`.
 */
export const Database = Cloudflare.D1.Database("Database", {
  name: APP_NAME,
}).pipe(Alchemy.RemovalPolicy.retain());

/**
 * Preexisting live `dolla-holla`. New logical id so adopt is a name
 * lookup (no prior state on this id). No `migrations:`. Retain so destroy
 * does not wipe production data.
 */
export const DollaHolla = Cloudflare.D1.Database(DOLLA_HOLLA_LOGICAL_ID, {
  name: D1_NAME,
}).pipe(Alchemy.AdoptPolicy.adopt(true), Alchemy.RemovalPolicy.retain());

/**
 * SvelteKit site. Compatibility date is `COMPATIBILITY_DATE`. No explicit
 * `nodejs_compat` flag (default-on at this date).
 * `BITWARDEN_ACCESS_TOKEN` is secret-zero for Varlock on the deploy
 * machine and is not a Worker binding. No `dolla-holla.org` route.
 * Worker `dollar-holler` stays that physical name. `env.DB` is DollaHolla.
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
    DB: DollaHolla,
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
          `alchemy stack refuses stage "${stage}". Deploy with --stage dev. Worker name stays ${APP_NAME}; live D1 name stays ${D1_NAME}.`
        )
      );
    }
    yield* Database;
    const site = yield* Website;
    return { url: site.url };
  })
);
