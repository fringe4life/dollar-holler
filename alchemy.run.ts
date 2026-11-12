/**
 * Alchemy deploy graph for the SvelteKit Worker.
 *
 * `bun run alchemy:deploy` is
 * `varlock run -- bun x alchemy deploy --stage dev` (`bun run` puts
 * `node_modules/.bin` on PATH; nested `bun x varlock` breaks Varlock).
 * Varlock resolves `.env.schema` into `process.env`. The
 * `env` block below binds those values on the Worker (`Config.Redacted`
 * → `secret_text`, `Config.String` → plain text). Community Alchemy path
 * until `@varlock/alchemy-integration`: no Vite Varlock plugin, no
 * `__VARLOCK_ENV` blob (https://github.com/dmno-dev/varlock/issues/735).
 *
 * Worker physical name is `dollar-holler`. Alchemy manages exactly one
 * D1: logical `Database`, Cloudflare name `dolla-holla`. `Website.env.DB`
 * binds that resource. There is no second D1 named `dollar-holler` or
 * `dollar-hollar`, no `AdoptPolicy`, and no UUID adopt of
 * `LIVE_PRODUCTION_D1_UUID`. Cloudflare already has named D1
 * `dolla-holla`; a later `alchemy:deploy` binds the Worker to it. Do not
 * create another D1. Leftover empty Cloudflare D1s are out of this
 * graph. Custom domain is `dolla-holla.org` (same hostname Wrangler used
 * before `alchemy deploy --adopt`). `workersDev` stays off. `ORIGIN` and
 * `PUBLIC_BASE_URL` are `Cloudflare.Worker.URL` so they follow that host
 * on deploy and the Vite URL under `alchemy dev`.
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

/** Public hostname. Worker custom domain; Better Auth / Kit CSRF origin. */
export const PUBLIC_SITE_HOST = "dolla-holla.org";

/** Canonical public origin. */
export const PUBLIC_SITE_URL = `https://${PUBLIC_SITE_HOST}`;

/** Flattened SQL from `scripts/flatten-d1-migrations.ts`. Applied on Alchemy deploy and local Database reconcile. */
export const D1_MIGRATIONS_DIR = "src/lib/server/db/d1";

/**
 * Leftover pre-Alchemy live D1 UUID. Not passed on the Database
 * resource. Local and remote CLI still refuse it.
 */
export const LIVE_PRODUCTION_D1_UUID = "08d44dec-3fb0-4ddc-bd6e-9d0b8aa8a185";

/**
 * App D1 `dolla-holla`. Local `alchemy dev` uses the local provider
 * (persist under `.alchemy/local/d1`). Live named D1 already exists;
 * do not declare a second database. No adopt, no UUID.
 */
export const Database = Cloudflare.D1.Database("Database", {
  name: D1_NAME,
  migrations: D1_MIGRATIONS_DIR,
});

/**
 * SvelteKit site. Compatibility date is `COMPATIBILITY_DATE`. No explicit
 * `nodejs_compat` flag (default-on at this date).
 * `BITWARDEN_ACCESS_TOKEN` is secret-zero for Varlock on the deploy
 * machine and is not a Worker binding. Worker `dollar-holler` stays
 * that physical name. `env.DB` is Database. Custom domain is
 * `PUBLIC_SITE_HOST` so cookies, CSRF, and Better Auth match
 * https://dolla-holla.org/. Omitting `domain` after adopt left the
 * Wrangler custom domain unmanaged and `Worker.URL` unset while
 * `workersDev` was already false.
 */
export const Website = Cloudflare.Website.SvelteKit("Website", {
  name: APP_NAME,
  workersDev: false,
  domain: PUBLIC_SITE_HOST,
  dev: {
    host: "127.0.0.1",
    port: 5173,
  },
  compatibility: {
    date: COMPATIBILITY_DATE,
  },
  // Logs default on; traces and Issues must be set or the next deploy
  // turns them off. SENTRY_AUTH_TOKEN is host-only (Vite source maps).
  observability: {
    enabled: true,
    issues: { enabled: true },
    logs: { enabled: true, invocationLogs: true },
    traces: { enabled: true },
  },
  env: {
    DB: Database,
    BETTER_AUTH_SECRET: Config.Redacted("BETTER_AUTH_SECRET"),
    OGYGIA_SECRET: Config.Redacted("OGYGIA_SECRET"),
    PUBLIC_BASE_URL: Cloudflare.Worker.URL,
    ORIGIN: Cloudflare.Worker.URL,
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
