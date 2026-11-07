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
 * Physical names stay on the spike. This beta's `Cloudflare.D1.Database`
 * only creates a database (`clone` copies into a new one; `Resource.ref`
 * reads a database Alchemy already deployed). Production D1 `dollar-holler`
 * is not adopted and its id is not passed. No custom domain.
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
 * Local Alchemy workerd here supports through `2026-11-02`. Wrangler
 * 4.157.0 `DEFAULT_COMPAT_DATE` is `2026-11-03`. Alchemy's own default is
 * `2026-08-31`. Was `2026-08-14` in wrangler.jsonc.
 *
 * `nodejs_compat` is default-on for dates on or after `2026-08-04`
 * (`NODEJS_COMPAT_DEFAULT_ON`). Alchemy's `withDefaultFlags` does not send
 * the flag after that date because Cloudflare rejects the redundant flag.
 * The SvelteKit resource comment says `getCompatibility` adds it; that
 * addition only happens before the cutoff. Tooling still sees the flag via
 * `getToolingCompatibility`.
 */
export const COMPATIBILITY_DATE = "2026-11-02";

/** Not the production Worker or D1 name `dollar-holler`. */
export const SPIKE_NAME = "dollar-holler-alchemy-spike";

/** Flattened SQL from `scripts/flatten-d1-migrations.ts`. Applied on Alchemy deploy. */
export const D1_MIGRATIONS_DIR = "src/lib/server/db/d1";

/** Live D1 `dollar-holler`. Remote migrate refuses this id. */
export const LIVE_D1_DATABASE_ID = "08d44dec-3fb0-4ddc-bd6e-9d0b8aa8a185";

/**
 * Spike D1 `dollar-holler-alchemy-spike`. `alchemy dev` uses the local
 * provider (persist under `.alchemy/local`). This resource is never
 * `Alchemy.remote()` and does not adopt production D1
 * `08d44dec-3fb0-4ddc-bd6e-9d0b8aa8a185`. Not applied by `alchemy:plan`.
 */
export const Database = Cloudflare.D1.Database("Database", {
  name: SPIKE_NAME,
  migrations: D1_MIGRATIONS_DIR,
});

/**
 * SvelteKit site. Compatibility date is `COMPATIBILITY_DATE`. No explicit
 * `nodejs_compat` flag (default-on at this date).
 * `BITWARDEN_ACCESS_TOKEN` is secret-zero for Varlock on the deploy
 * machine and is not a Worker binding.
 */
export const Website = Cloudflare.Website.SvelteKit("Website", {
  name: SPIKE_NAME,
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
  SPIKE_NAME,
  {
    providers: Cloudflare.providers(),
    state: Alchemy.localState(),
  },
  Effect.gen(function* () {
    const stage = yield* Alchemy.Stage;
    if (FORBIDDEN_STAGES.has(stage)) {
      return yield* Effect.die(
        new Error(
          `alchemy stack refuses stage "${stage}". Deploy with --stage dev. Worker and D1 names stay dollar-holler-alchemy-spike.`
        )
      );
    }
    const site = yield* Website;
    return { url: site.url };
  })
);
