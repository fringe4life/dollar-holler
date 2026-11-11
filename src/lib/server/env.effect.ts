/**
 * Generated from .env.schema by Varlock for Effect 4. Do not edit by hand.
 */
import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import * as Redacted from "effect/Redacted"
import * as Schema from "effect/Schema"
import * as SchemaIssue from "effect/SchemaIssue"

function redactErrors<A>(config: Config.Config<A>, key: string): Config.Config<A> {
  return Config.orElse(config, () => {
    const error = new Schema.SchemaError(
      new SchemaIssue.Pointer([key], new SchemaIssue.InvalidValue({ message: "<redacted>" })),
    )
    // Config.fail is typed as Config<unknown> in this Effect release, but never succeeds.
    return Config.fail(error) as Config.Config<never>
  })
}


export const config = Config.all({
  /**
   * Auto-detected deployment environment (development, preview, staging, production, test)
   */
  "VARLOCK_ENV": redactErrors(Config.map(Config.String("VARLOCK_ENV"), Redacted.make), "VARLOCK_ENV"),
  /**
   * Docs: https://www.better-auth.com/docs/installation | Signing secret for sessions and tokens
   */
  "BETTER_AUTH_SECRET": redactErrors(Config.map(Config.String("BETTER_AUTH_SECRET"), Redacted.make), "BETTER_AUTH_SECRET"),
  /**
   * Docs: https://www.better-auth.com/docs/installation | baseURL and trustedOrigins
   */
  "PUBLIC_BASE_URL": Config.String("PUBLIC_BASE_URL"),
  /**
   * Kit CSRF origin for server-island / remote form POSTs (must match the public site URL in prod).
   * Docs: https://svelte.dev/docs/kit/configuration#csrf | SvelteKit ORIGIN (CSRF)
   * Docs: https://ogygiajs.dev/docs/start/install | ogygia production env
   */
  "ORIGIN": Config.String("ORIGIN"),
  /**
   * Stable HMAC for signed island holes across deploys (PPR). ≥16 UTF-8 bytes in production builds.
   * Docs: https://ogygiajs.dev/docs/start/install | ogygia OGYGIA_SECRET
   */
  "OGYGIA_SECRET": redactErrors(Config.map(Config.String("OGYGIA_SECRET"), Redacted.make), "OGYGIA_SECRET"),
  /**
   * Docs: https://docs.sentry.io/product/accounts/auth-tokens/ | Auth token for source map uploads at build time
   * Docs: https://docs.sentry.io/platforms/javascript/guides/sveltekit/ | Sentry SvelteKit integration
   */
  "SENTRY_AUTH_TOKEN": redactErrors(Config.map(Config.String("SENTRY_AUTH_TOKEN"), Redacted.make), "SENTRY_AUTH_TOKEN"),
  /**
   * Remote D1 HTTP (db:seed:remote, db:migrate:remote, drizzle-kit studio/push).
   * Varlock resolves these via Bitwarden; never commit the values. Stay @optional
   * so local `varlock run` (dev, migrate, seed, generate) and a first Alchemy
   * deploy still start before the vault has a dolla-holla UUID. Remote CLI still
   * requires all three in parseRemoteD1Credentials. .env.test supplies CI dummies.
   * Bitwarden secret id 5b4a4abc-5174-4f51-b6ac-b482005cc07a — keep this schema key.
   * Docs: https://developers.cloudflare.com/fundamentals/account/find-account-and-zone-ids/ | Cloudflare account ID for D1 HTTP (drizzle-kit)
   */
  "CLOUDFLARE_ACCOUNT_ID": redactErrors(Config.option(Config.map(Config.String("CLOUDFLARE_ACCOUNT_ID"), Redacted.make)), "CLOUDFLARE_ACCOUNT_ID"),
  /**
   * Alchemy D1 named dolla-holla. Update the vault *value* of this secret to that
   * database UUID after alchemy deploy. Never leftover 08d44dec-3fb0-4ddc-bd6e-9d0b8aa8a185.
   * Bitwarden secret id f31e55fa-53d9-4232-a66f-b4a6002e5581 — schema key CLOUDFLARE_D1_DATABASE_ID.
   * Docs: https://developers.cloudflare.com/d1/get-started/ | Alchemy D1 UUID for dolla-holla (Bitwarden; not committed)
   */
  "CLOUDFLARE_D1_DATABASE_ID": redactErrors(Config.option(Config.map(Config.String("CLOUDFLARE_D1_DATABASE_ID"), Redacted.make)), "CLOUDFLARE_D1_DATABASE_ID"),
  /**
   * Create a Secrets Manager item for a D1-edit API token, then set this line to
   * bitwarden("<item-uuid>"). Do not put the token in git or chat. Stays optional
   * so local alchemy dev can boot without Cloudflare; remote CLI still refuses empty.
   * Docs: https://developers.cloudflare.com/fundamentals/api/get-started/create-token/ | Cloudflare API token with D1 edit (drizzle-kit d1-http)
   */
  "CLOUDFLARE_API_TOKEN": redactErrors(Config.option(Config.map(Config.String("CLOUDFLARE_API_TOKEN"), Redacted.make)), "CLOUDFLARE_API_TOKEN"),
})

/** Loads environment values when executed, converting config failures to defects. */
export const generated = config.pipe(Effect.orDie)
