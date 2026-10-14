# Research: Alchemy v2 and Effect v4 against issues 43 and 136

**Date:** 2026-10-08  
**Scope:** Primary-source check of two beliefs in [issue 43](https://github.com/fringe4life/dollar-holler/issues/43) (Effect v4) and [issue 136](https://github.com/fringe4life/dollar-holler/issues/136) (Alchemy) for this SvelteKit app on Cloudflare. Sources are official docs, first-party GitHub, npm packuments, measurements run for this note, and paths in this repo.  
**Out of scope:** an implementation plan, issue edits, and any rewrite of application code.

Issue 43 comments under test: 2026-08-18 “A small piece of research into cloudflare + effect v4 indicates issues”; 2026-10-03 “V4 is stable and could be used with alchemy.” Issue 136 asks what Alchemy brings versus bundle size, and a 2026-10-07 comment ties it to issue 43.

---

## Verdict

1. **Alchemy v2 is infrastructure-as-code written in Effect, and it is still a beta.** npm `latest` on 2026-10-08 is `alchemy@2.0.0-beta.81` (published 2026-10-05), peer `effect@^4.0.0`. The current docs call it Infrastructure as Code built in Effect, with an optional “Infrastructure as Effects” mode that puts Worker handlers in the same program. It can also deploy a SvelteKit site without rewriting handlers as Effects.
2. **Effect 4 is a stable TypeScript library whose core includes services, layers, and dependency injection.** npm `effect@4.0.0` published 2026-10-01; `4.0.1` published 2026-10-05. The 4.0 announcement (blog last updated 2026-09-30) and the 4.0.1 README call 4.x an LTS line. The same announcement says some newer modules are still `@stability unstable` or `@stability experimental`. “v4 is stable” is true for the release, not for every module.
3. **Effect and Alchemy do not, on the evidence here, fix the Better Auth pattern this repo already uses.** This repo defers `betterAuth()` until first call because the Drizzle adapter reads `db._` at construct time, and `db` touches the D1 binding. That is an isolate-cached singleton. Better Auth’s own Cloudflare guidance is `nodejs_compat` / `nodejs_als`, plus constructing auth where `env.DB` exists. A separate open Better Auth issue describes isolate-cached lazy init hanging when the first request is aborted. Alchemy documents a different stack: an Effect `BetterAuth` service plus a `CloudflareD1` layer on an Effect Worker, not a patch for this SvelteKit `getAuth()`.
4. **Varlock has a first-party Effect plugin. This repo does not use it.** `@varlock/effect-plugin@0.1.0` peers `varlock@^1.21.0` and `effect` from `4.0.0-rc.113` through 4.x. This repo depends on `varlock@1.21.1` and reads `ENV` from `varlock/env`.
5. **Drizzle 1.0.0-rc.4, the version in this repo, ships an Effect D1 driver inside `drizzle-orm`.** The app uses the Promise driver `drizzle-orm/d1` and Valibot schemas, not `drizzle-orm/effect-d1` or `drizzle-orm/effect-schema`. The Effect D1 API still needs `@effect/sql-d1`’s `D1Client`. Effect also ships its own Schema module (`effect/Schema`). Using Effect does not require replacing `valibot@1.5.0`. Schema size was not measured.
6. **SvelteKit remote functions would keep their client contract.** Server callbacks are already `MaybePromise`. Running Effect means `Effect.runPromise` (or a `ManagedRuntime`) inside those callbacks and mapping Effect failures back to values Kit already returns. Call sites, `query` / `form` / `command` exports, and Valibot schemas would not become Effect types.
7. **Bundle cost splits cleanly.** Alchemy’s published package is about 134 MiB unpacked and is a deploy-time CLI plus provider graph, not something this Worker imports today. A minified esbuild of `effect@4.0.1` that only runs `Effect.succeed` is 24,988 bytes (8,927 gzip). Adding a `Context.Service` and a `Layer` is 34,442 bytes (12,378 gzip). Importing `drizzle-orm/effect-d1` in a similarly empty program is 210,327 bytes (67,526 gzip). None of those approach Cloudflare’s 64 MiB uncompressed Worker cap. Startup time (1 second of global-scope CPU) is the limit that has actually bitten Effect-on-workerd reports. This app’s current Worker upload size was not measured.
8. **The August 2026 Cloudflare concern is real as upstream history, and it is not one open “Effect v4 cannot run on Workers” bug.** An open v3 issue describes a workerd hang when the first request aborts during lazy HTTP layer build. A v4-RC issue about `Effect.fn` stack captures burning startup CPU was closed in September 2026. Current Effect and Alchemy docs both describe Cloudflare Workers as a supported target. Whether the v3 hang still exists in `effect@4.0.1`’s in-package HTTP stack was not re-tested.

### Pros and cons for this app (not a recommendation)

**Alchemy (issue 136)**

- Pros: one TypeScript program can declare Cloudflare resources (including D1) and deploy this SvelteKit app via `Cloudflare.Website.SvelteKit`, without a `wrangler.json` and without `@sveltejs/adapter-cloudflare`. A plain Worker can stay a `fetch` handler. There is a first-party Better Auth + D1 layer if the app were rewritten as an Effect Worker.
- Cons: `2.0.0-beta.81` is not a stable major. Peer `drizzle-orm` is pinned to `1.0.0-rc.5-ab785fc`, not this repo’s `1.0.0-rc.4`. The current SvelteKit guide still tells server code to read `platform.env`, while this app and adapter-cloudflare 8 use `cloudflare:workers`. Adopting it replaces `wrangler deploy` and the local `cloudflare:workers` stub/restore workaround; whether that workaround is still required under Alchemy’s in-memory adapter is unresolved. The Better Auth integration is a different runtime, not a drop-in for `getAuth()`.

**Effect (issue 43)**

- Pros: 4.0.1 is an LTS release; services and layers are core modules; a small Effect program tree-shakes to tens of kilobytes; Varlock and this repo’s Drizzle version both have Effect integrations; `ManagedRuntime` is the documented way to run Effect inside another framework.
- Cons: remote handlers, Drizzle helpers, and Better Auth stay Promise-based unless each boundary is wrapped. `drizzle-orm/effect-d1` does not replace `drizzle-orm/d1` in place: queries become Effects and need `D1Client`. Some Effect modules are still marked unstable. Workerd startup cost and the aborted-first-request hang are documented failure modes; the hang issue is still open on the v3 line and was not re-verified on 4.0.1. Putting Effect in every remote does not, by itself, fix Better Auth’s isolate cache.

### Facts established

- Deploy today is Wrangler, not Alchemy: `package.json` script `deploy` is `bun run build && wrangler deploy`; `wrangler.jsonc` names the Worker, `nodejs_compat`, custom domain, assets, and D1 binding `DB`.
- Auth is isolate-cached `getAuth()` in `src/lib/auth.server.ts`.
- D1 is `import { env } from "cloudflare:workers"` behind a Proxy in `src/lib/server/db/index.ts`.
- `effect@4.0.1` and `alchemy@2.0.0-beta.81` are the npm `latest` versions fetched on 2026-10-08.

### Costs

| Thing | Kind | Evidence |
| --- | --- | --- |
| `effect@4.0.1` published package | npm artifact, not a Worker | unpacked 49,597,078 bytes, 2,561 files; tarball from `npm pack` 8,925,614 bytes |
| Minimal Worker-shaped Effect program | runtime bundle | esbuild minify, 24,988 bytes / 8,927 gzip |
| Effect service + layer program | runtime bundle | 34,442 bytes / 12,378 gzip |
| `drizzle-orm/effect-d1` import in an empty program | runtime bundle | 210,327 bytes / 67,526 gzip |
| `alchemy@2.0.0-beta.81` | IaC / CLI package | unpacked 140,879,054 bytes; not imported by this Worker |
| Alchemy code inside the SvelteKit Worker | runtime | not measured |

### Fit

| Piece | Fit |
| --- | --- |
| Better Auth lazy singleton | Stays a Workers concern. Alchemy’s Better Auth docs are a different architecture. |
| Varlock 1.21.1 | Plugin peer range matches. App would have to opt into codegen; `ENV` would not become an Effect `Config` by itself. |
| Drizzle D1 | Effect driver exists in the installed package. Current call sites use `drizzle-orm/d1` Promises. |
| Remote functions | Boundary wrap only. Client `await query()` stays. |

### Unresolved (a later grill still needs a human)

- Whether `effect@4.0.1` HTTP handlers still hang an isolate when the first request aborts ([Effect-TS/effect#6319](https://github.com/Effect-TS/effect/issues/6319) is open and filed against v3).
- Whether Alchemy’s SvelteKit adapter emits `cloudflare:workers` or still expects `platform.env`, and whether `vite.config.ts`’s stub/restore plugin can be deleted.
- This Worker’s current upload size and startup CPU, with and without `effect`.
- Whether `@alchemy.run/better-auth` on beta.81 avoids [better-auth#10315](https://github.com/better-auth/better-auth/issues/10315).
- Whether any Effect module this app would actually import is still `@stability unstable`.

---

## 1. Alchemy v2 is IaC on Effect, and it is a beta

npm `alchemy@latest` resolved to `2.0.0-beta.81` on 2026-10-08, published 2026-10-05. Peer dependencies include `effect@^4.0.0`. Direct dependencies include `@effect/sql-d1`, `@effect/sql-sqlite-do`, `@distilled.cloud/cloudflare`, and `@alchemy.run/cloudflare-runtime`, all at matching beta/rc lines (`npm view alchemy@2.0.0-beta.81`).

The docs page [What is Alchemy?](https://alchemy.run/what-is-alchemy) says Alchemy is “Infrastructure as Code built in pure Effect,” in the same family as Terraform and Pulumi, and that “Infrastructure as Effects” lets the code that runs on those resources live in the same program as typed Effects and Layers. A Stack is an Effect that yields resources. Providers are Effect Layers. A Worker can be declared two ways on that page:

- Effectful constructor: `Cloudflare.Worker(..., Effect.gen(...))`, bindings as `yield*`, handlers as Effects.
- Plain module: `main` points at a `fetch(request, env)` file, with `Cloudflare.InferEnv` typing `env`. The page says this is fully supported.

So claim (1) is right about the model, and incomplete about status: the published line is `2.0.0-beta.81`, not a stable `2.0.0`. An older guide still on the same site, [guides/cloudflare-sveltekit](https://alchemy.run/guides/cloudflare-sveltekit/), shows the pre-Effect `await alchemy(...)` API and a `svelte.config.js` adapter. The v2 page that matches kit v3 is [SvelteKit](https://alchemy.run/cloudflare/frontend/sveltekit/).

That v2 page says `Cloudflare.Website.SvelteKit` builds with SvelteKit’s Vite pipeline and a wrangler-free in-memory adapter, then re-bundles server output for workerd. It says there is no `svelte.config.js`, no `@sveltejs/adapter-cloudflare`, and no Wrangler file. `nodejs_compat` is added automatically. `@alchemy.run/frontend-frameworks` is a dev dependency used at build time. The checked-in example is `examples/cloudflare-website-sveltekit`. GitHub issue [alchemy-run/alchemy#886](https://github.com/alchemy-run/alchemy/issues/886) (closed, merged) is the feature that added `Cloudflare.Website.SvelteKit`.

For Alchemy v2, do not install or select `@sveltejs/adapter-cloudflare`. The example `vite.config.ts` only calls `sveltekit()` and says not to declare an adapter, because Alchemy injects its own into that plugin at deploy time. Deploy is `alchemy deploy`, not `wrangler deploy`. Alchemy v1 was the opposite: the adapter lived in `svelte.config.js` (`import alchemy from "alchemy/cloudflare/sveltekit"`), and some apps kept `@sveltejs/adapter-cloudflare` beside it. Example repos are in the section below.

This repo has no Alchemy config. Deploy is Wrangler:

- `package.json`: `"deploy": "bun run build && wrangler deploy"`, `wrangler` `4.147.0`.
- `wrangler.jsonc`: Worker name `dollar-holler`, `main` `.svelte-kit/cloudflare/_worker.js`, `compatibility_date` `2026-08-14`, `compatibility_flags` `["nodejs_compat"]`, custom domain `dolla-holla.org`, assets, D1 binding `DB`.

---

## 2. Effect v4 is the services / layers library, and 4.0 is a stable release

`effect@4.0.1` README (registry, 2026-10-05) describes the package as the core framework: side effects, errors, concurrency, resources, and structured data. It lists `Context` as “a lightweight dependency injection mechanism” and `Layer` as “a system for managing dependencies.” It states “Effect 4.x is a long-term support (LTS) release.” Requirements named there: TypeScript 5.9+ (7 recommended), Node 18+ when running on Node, `strict`. In v4, former separate packages ship inside `effect` under `effect/*`, including `http`, `sql`, and `cli`.

v4 API pages:

- [Context](https://effect.website/docs/v4/api/effect/Context): a `Context` holds service implementations; Effects use contexts as their environment so services can be provided once.
- [Layer](https://effect.website/docs/v4/api/effect/Layer): a `Layer<ROut, E, RIn>` describes how to acquire services, which services are required to build them, and which errors construction can produce.
- [Runtime](https://effect.website/docs/v4/runtime): `ManagedRuntime` is for integrating services and layers “where Effect is not the primary framework and access to the main entry point is restricted.”

[Effect 4.0](https://effect.website/blog/releases/effect/40) (Sebastian Lorenz, last updated 2026-09-30) says “Today, we’re releasing Effect 4.0,” that the core package has zero runtime dependencies, and that 4.x gets bug fixes until September 2029 or one year after 5.0, whichever is later (security fixes until September 2029 or two years after 5.0). The same post says some newer modules remain `@stability unstable` or `@stability experimental` and may change in minor or patch releases. It names Alchemy as a project that grew around Effect.

npm publish times fetched 2026-10-08: `4.0.0` at 2026-10-01, `4.0.1` at 2026-10-05. The September RC recap says the stable release closed the RC cycle: [Effect v4 RC: September 2026 Updates](https://effect.website/blog/effect-v4-rc-september-recap) (last updated 2026-10-01).

The 2026-10-03 issue comment is right that v4 shipped stable, and that Alchemy’s current peer is Effect 4. It is wrong if read as “every Effect module is stable.”

---

## 3. Better Auth, Cloudflare, and this repo’s lazy `getAuth()`

Three different problems get collapsed in the issues. Only one is what this code does.

### What this repo does

`src/lib/auth.server.ts` builds Better Auth inside `createAuth()` and exports `getAuth()`, which assigns `instance ??= createAuth()`. The comment on `getAuth` says `drizzleAdapter` reads `db._` at construct and must not run at import.

The adapter in this install agrees. `node_modules/@better-auth/drizzle-adapter/dist/schema-check-DFZjRat1.mjs` documents:

- Drizzle 0.x relations v1: `db._.schema`
- Drizzle 1.x relations v2: `db._.relations`

`node_modules/@better-auth/drizzle-adapter/dist/relations-v2/index.mjs` reads `db._?.relations` while building the adapter (this repo imports `@better-auth/drizzle-adapter/relations-v2`). Versions: `better-auth` and `@better-auth/drizzle-adapter` `1.7.7` (`package.json`).

`src/lib/server/db/index.ts` exports `db` as a Proxy. The first property access calls `getDb()`, which reads `env.DB` from `import { env } from "cloudflare:workers"`. A module-scope `betterAuth({ database: drizzleAdapter(db) })` would touch that binding at import. `getAuth()` moves that touch to the first call and then reuses one instance per isolate.

Call sites: `src/hooks.server.ts` (`svelteKitHandler`), `src/lib/features/auth/auth.remote.ts`, `src/lib/features/auth/require-user.server.ts`.

`README.md` states the same reason, and states that adapter-cloudflare 8 next.7+ dropped `event.platform`. Runtime D1 is the Wrangler `DB` binding, not a URL. `wrangler.jsonc` already sets `nodejs_compat`.

A second, related workaround is build-time, not auth-specific. `vite.config.ts` rewrites `cloudflare:workers` to the adapter’s Node stub for SSR/prerender and `vite preview`, then restores it so Wrangler can bundle. The comment says this is still required on `@sveltejs/adapter-cloudflare@8.0.0` and `@sveltejs/kit@3.0.0`, and points at [sveltejs/kit#17271](https://github.com/sveltejs/kit/issues/17271) (open) and [sveltejs/kit#16966](https://github.com/sveltejs/kit/issues/16966).

### What Better Auth’s own docs say

[Installation](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/installation.mdx) (same text on [the 1.6 installation page](https://better-auth.com/docs/1.6/installation)): Better Auth uses `AsyncLocalStorage`. On Cloudflare Workers, set `nodejs_compat`, or `nodejs_als` if that is the only Node compatibility needed. The Hono integration page repeats the flag: [Hono integration](https://better-auth.com/docs/integrations/hono).

[Better Auth 1.5](https://better-auth.com/blog/1-5) shows D1 as a first-class database: construct `betterAuth({ database: env.DB })` inside the Worker `fetch`, not at module scope. It says D1 has no interactive transactions and Better Auth uses D1 `batch()` instead. That snippet is the built-in D1 dialect, not the Drizzle adapter this repo uses.

[Database](https://better-auth.com/docs/concepts/database) says Cloudflare D1 can only be queried through a Worker, so the CLI cannot reach it directly, and `getMigrations` does not work with the Drizzle adapter.

None of those pages document this repo’s “Proxy `db` + isolate-cached `getAuth()`” pattern.

### Community workaround, still open

[better-auth#10315](https://github.com/better-auth/better-auth/issues/10315) (open, label `core`, created 2026-07-05, updated 2026-09-30) is the issue that matches the shape of `getAuth()`: `cachedAuth ??= betterAuth(...)` on a Worker with `nodejs_compat`. The report says a promise created while handling a request belongs to that request’s IoContext; if the client aborts first, workerd never settles it; Better Auth caches that promise (`AsyncLocalStorage` dynamic import, and `auth.$context`). Later calls on that isolate hang. The reporter’s workaround, stated in the issue, is: pre-seed the three AsyncLocalStorage instances from a static `node:async_hooks` import, anchor `auth.$context` with `ctx.waitUntil`, and race `getSession` with a hang detector. That is a community report, not an official docs page. It was filed against `better-auth@1.6.20`. This note did not verify whether `1.7.7` changed that path.

Older [better-auth#969](https://github.com/better-auth/better-auth/issues/969) records a different workaround people used for “The script will never generate a response”: construct the database and auth per request. A maintainer comment there says many reports were libraries Workers do not support, such as `pg`, and that singletons should be created per request. That is not the same bug as #10315, and it is not what `getAuth()` does (one instance per isolate, not per request).

### What Alchemy offers instead

[Better Auth](https://alchemy.run/better-auth/) says Alchemy supplies database bindings, a stable signing secret, and supported schema migrations, and that the Auth service is an ordinary Effect service. [CloudflareD1](https://alchemy.run/providers/betterauth/cloudflared1) (source path cited on the page: `packages/better-auth/src/CloudflareD1.ts`) provides `BetterAuth.Database`. At runtime the Worker uses the native D1 binding; at deploy time migrations use the D1 HTTP API and are not shipped in the Worker bundle. The sample yields `BetterAuth` inside `Cloudflare.Worker` and `Effect.provide(CloudflareD1(AuthDb))`.

That is a supported alternative architecture. It does not say it fixes #10315, and it does not target `src/lib/auth.server.ts`. Using it would replace `betterAuth()` + `svelteKitHandler` with Alchemy’s Effect HTTP handler. Unresolved: the `@alchemy.run/better-auth` version bundled with beta.81, and whether that build still lazy-inits Better Auth inside a request.

[Effect-TS/effect#6319](https://github.com/Effect-TS/effect/issues/6319) explicitly cross-links #10315 as the same workerd “lazy promise inside the first request” class of bug, on the Effect HTTP side.

---

## 4. Varlock’s Effect integration vs this repo

[Effect plugin](https://varlock.dev/plugins/effect/) says `@varlock/effect-plugin` generates an Effect `Config` module from a Varlock schema, for Effect 3 and Effect 4. The schema decorator is `@generateEffectConfig`. The generated `generated` export is an Effect; `config` is the underlying `Config`. The page says Effect 4 support starts at `4.0.0-rc.113`.

npm `@varlock/effect-plugin@0.1.0` peers:

- `effect`: `>=3.22.1 <4 || >=4.0.0-rc.113 <5`
- `varlock`: `^1.21.0`

This repo’s `package.json` has `varlock@1.21.1`, `@varlock/vite-integration@1.5.2`, and `@varlock/bitwarden-plugin@2.0.1`. It does not depend on `@varlock/effect-plugin`. Auth reads `ENV.PUBLIC_BASE_URL` and `ENV.BETTER_AUTH_SECRET` from `varlock/env` (`src/lib/auth.server.ts`). Vite uses `varlockVitePlugin({ ssrInjectMode: "resolved-env" })` (`vite.config.ts`). Scripts such as `db:generate` use `varlock run`.

The peer range matches 1.21.1. Adopting the plugin would be new codegen plus an `effect` dependency. It does not replace the Vite integration by itself. [Code generation](https://varlock.dev/guides/code-generation/) points at the same plugin.

### Varlock vs `platform.env`

They are different channels. No Varlock page fetched 2026-10-08 says it reads `event.platform.env`.

Alchemy’s SvelteKit example puts stack `env` (and, in `alchemy dev`, real D1/KV/R2 bindings) on `platform.env`. App code in that example reads `platform.env.GREETING`. That object is the Worker binding bag.

This repo reads two other objects:

- `import { ENV } from "varlock/env"` for schema values (`PUBLIC_BASE_URL`, `BETTER_AUTH_SECRET` in `src/lib/auth.server.ts`). `.env.schema` sets `@encryptInjectedEnv=forEnv(production)`.
- `import { env } from "cloudflare:workers"` for the D1 binding `env.DB` (`src/lib/server/db/index.ts`).

Current Vite mode is `ssrInjectMode: "resolved-env"`, which bakes the resolved env blob into the SSR build. [Vite](https://varlock.dev/integrations/vite/) says not to use that mode on Cloudflare: if `@sveltejs/adapter-cloudflare` or `@varlock/cloudflare-integration` is detected and the mode is explicitly `resolved-env`, the plugin throws rather than ship resolved values in the Worker artifact. This repo has the adapter and that mode, and does not depend on `@varlock/cloudflare-integration`.

Varlock’s SvelteKit + Cloudflare path ([SvelteKit](https://varlock.dev/integrations/sveltekit/)) detects `@sveltejs/adapter-cloudflare`, injects a `cloudflare:workers` loader at the top of the SSR entry, and at Worker boot reads a `__VARLOCK_ENV` binding. The loader checks `navigator.userAgent === "Cloudflare-Workers"` so Node prerender/fallback does not import `cloudflare:workers`. `varlock-wrangler deploy` uploads non-sensitive values as vars, sensitive values as secrets, and that `__VARLOCK_ENV` blob ([Cloudflare Workers](https://varlock.dev/integrations/cloudflare/), [Encrypted deployments](https://varlock.dev/guides/encrypted-deployments/)). `ENV.*` then hydrates from that binding. D1 stays a separate binding. Varlock does not turn `platform.env.DB` into `ENV.DB`.

Alchemy v2 removes `@sveltejs/adapter-cloudflare` and deploys with `alchemy deploy`, not `varlock-wrangler`. The auto-detect and the `__VARLOCK_ENV` upload both key off the adapter / wrangler wrapper Alchemy replaces. Whether Alchemy’s in-memory adapter still surfaces a `cloudflare:workers` `env` that a Varlock loader could read was not tested.

---

## 5. Drizzle’s Effect integration vs `drizzle-orm/d1`

`package.json` depends on `drizzle-orm@1.0.0-rc.4` and `drizzle-kit@1.0.0-rc.4`. The runtime client is `drizzle` from `drizzle-orm/d1` in `src/lib/server/db/create-db.ts`. Schemas use `drizzle-orm/sqlite-core` (`src/lib/server/db/schema.ts`). Insert/select schemas in feature `schemas.server.ts` files import `drizzle-orm/valibot`.

The installed `drizzle-orm@1.0.0-rc.4` `package.json` also exports Effect entry points, including `./effect-d1`, `./effect-postgres`, `./effect-schema`, and several `./effect-sqlite-*` drivers. Effect peers include `effect` and `@effect/sql-d1` at `>=4.0.0-beta.83 || >=4.0.0`.

`node_modules/drizzle-orm/effect-d1/driver.d.ts` says `make` returns an `Effect` that requires `EffectCache`, `EffectLogger`, and `D1Client` from `@effect/sql-d1/D1Client`. `makeWithDefaults` still requires `D1Client`. Queries on that database type are Effects (`SQLiteEffectDatabase`), not the Promise API `createDb` returns today.

Published docs found for the Effect driver are Postgres-specific: [Effect Postgres](https://orm.drizzle.team/docs/connect-effect-postgres) and the [effect-postgresql get-started](https://orm.drizzle.team/docs/get-started/effect-postgresql-new) (`drizzle-orm/effect-postgres` + `@effect/sql-pg`). [Cloudflare D1](https://orm.drizzle.team/docs/sqlite/connect-cloudflare-d1) documents `drizzle-orm/d1` inside `fetch`, which is the API this repo uses. [effect-schema](https://orm.drizzle.team/docs/sqlite/effect-schema) documents `createInsertSchema` / `createSelectSchema` / `createUpdateSchema` from `drizzle-orm/effect-schema` for SQLite tables. This repo uses Valibot for that job.

npm `@effect/sql-d1@4.0.1` describes itself as “A Cloudflare D1 integration for Effect” and peers `effect@^4.0.1`.

`drizzle-orm` 1.0.0-rc.1 release notes say that version switched the Effect integration from Effect v3 to Effect v4 beta ([v1.0.0-rc.1](https://github.com/drizzle-team/drizzle-orm/releases/tag/v1.0.0-rc.1)). The rc.4 package in this repo is the later artifact; its export list is the evidence for D1, not that release note (the note’s sample is Postgres).

Alchemy’s peer on `drizzle-orm` is `1.0.0-rc.5-ab785fc`, not `1.0.0-rc.4` (`npm view alchemy@2.0.0-beta.81`). Installing Alchemy beside this app would not match the Drizzle version already pinned here.

### Effect Schema vs Valibot

Not compared in the first pass. The note only said this repo’s insert/select schemas and remote-function schemas stay Valibot, and that `drizzle-orm/effect-schema` is the Effect-shaped replacement for `drizzle-orm/valibot`.

`effect@4.0.1` ships Schema inside the same package (`effect/Schema`). It is not a required import for `Effect.succeed`, services, or layers. The measured 24,988-byte program did not import Schema. [effect#7927](https://github.com/Effect-TS/effect/pull/7927) treats a retained Schema graph as the thing that inflates a Worker, and reports 283 KB (41 KB min+gzip) only for a router built with no Schema graph retained. This note did not esbuild `import { Schema } from "effect"`.

[Schema.toStandardSchemaV1](https://effect.website/docs/v4/schema/standard-schema) turns an Effect schema into a Standard Schema V1 object. The schema’s `DecodingServices` must be `never`. Validation is sync unless a check or transform is async. This repo already passes Valibot schemas into remote `query` (`valibot@1.5.0`, for example `listQuerySchema` in `src/lib/features/invoices/invoices.remote.ts`). SvelteKit remote functions accept a Standard Schema there. Effect Schema is an optional second schema library, not a requirement for running Effect inside those callbacks. `drizzle-orm/effect-schema` is the place the two would meet if insert/select schemas moved off `drizzle-orm/valibot`.

---

## 6. Remote functions: what would change

Official docs: [Remote functions](https://svelte.dev/docs/kit/remote-functions). They are experimental. Opt in with `compilerOptions.experimental.async` and `experimental.remoteFunctions` on the SvelteKit Vite plugin. A remote module’s name includes `remote`. Exports are `query`, `form`, `command`, or `prerender`. On the client they become `fetch` wrappers. The `query` callback type is a function returning `MaybePromise<Output>`. Queries cannot be used when the page is fully prerendered.

This repo opts in in `vite.config.ts` (`async: true`, `remoteFunctions: true`). Live remote modules:

| File | Role |
| --- | --- |
| `src/lib/features/invoices/invoices.remote.ts` | `query` list/get/detail; `form` save; `command` status and delete |
| `src/lib/features/clients/clients.remote.ts` | `query` / `form` / `command` for clients |
| `src/lib/features/settings/settings.remote.ts` | `query` get; `form` save |
| `src/lib/features/auth/auth.remote.ts` | `form` only (login, signup, forgot, reset, logout, change password), each calling `getRequestEvent()` then `getAuth()` |

`docs/remote-functions-migration.md` still lists `src/lib/features/line-items/line-items.remote.ts` and calls logout a `command`. The tree has no `line-items.remote.ts`, and logout is a `form`. The file is otherwise the right map: pages `await` queries, writes go to `*.server.ts` Drizzle helpers, Better Auth HTTP stays on `svelteKitHandler`.

Effect’s own integration point for a foreign framework is `ManagedRuntime` ([Runtime](https://effect.website/docs/v4/runtime)): build it from a `Layer`, then run operations from request handlers. `Effect.runPromise` is the one-shot runner used in the v4 runtime docs when the effect’s requirements are already satisfied.

What would change:

- Each server callback that should run Effect would call `runPromise` / the managed runtime and return the success value. The callback stays a normal async function because the documented return type is `MaybePromise`, not `Effect`.
- Layers (`D1Client`, a Drizzle Effect db, a Varlock `Config` effect) would be provided at that boundary or inside the runtime. They would not appear in the client transform.
- Typed Effect failures would have to be turned into what these handlers already use: returned data, `invalid(...)`, or `redirect` (see `auth.remote.ts`). The client still sees a fetch result, not an `Effect` type.
- `getRequestEvent()` is called synchronously at the start of each auth form today. Effect docs do not say a fiber keeps SvelteKit’s request AsyncLocalStorage. Whether `yield*` after the first await can still see `getRequestEvent()` is unresolved. The safe reading of this code is: read the request event in the callback body before entering Effect.

What would not change:

- Module filenames, `query` / `form` / `command` exports, client `await`, `.refresh()` / `requested(...).refreshAll()`, Valibot schemas, or the experimental flags.
- `src/hooks.server.ts` and `/api/auth`, unless auth itself moves into an Effect service.
- Existing `*.server.ts` helpers, until someone rewrites them off `drizzle-orm/d1`. Wrapping only the remote callback can call today’s async helpers unchanged.

---

## 7. Bundle cost, measured

Cloudflare’s limit is uncompressed upload size, 64 MiB on Free and Paid, with no compressed-size cap ([Limits](https://developers.cloudflare.com/workers/platform/limits/), last updated 2026-09-05). Gzip figures below are only for comparison. Larger bundles can still hurt startup; the same page sets startup time to 1 second of global scope.

### Published packages (not Worker bundles)

Fetched from the npm registry on 2026-10-08:

| Package | unpackedSize | Notes |
| --- | --- | --- |
| `effect@4.0.1` | 49,597,078 bytes (2,561 files) | `npm pack` tarball was 8,925,614 bytes. `package.json` `sideEffects` lists only the Schema JIT enable modules. |
| `alchemy@2.0.0-beta.81` | 140,879,054 bytes | CLI, providers, rolldown, cloud SDKs. Peer `effect@^4.0.0`. |

The Effect 4.0 blog’s “7.1 kB” figure is a minified+gzip minimal program versus 3.x’s 35.6 kB, from identical source, not the unpacked npm tarball. This note re-measured 4.0.1 rather than repeating that chart.

### esbuild traces (this note, 2026-10-08)

Tool: `esbuild@0.25.10`, `--bundle --minify --format=esm --platform=neutral`. Temp directory, not this repo. `effect@4.0.1`.

| Entry | Raw | gzip |
| --- | --- | --- |
| `import * as Effect from "effect/Effect"` and `Effect.runPromise(Effect.succeed("ok"))` inside `fetch` | 24,988 | 8,927 |
| Same plus `Context.Service`, `Layer.succeed`, `Effect.provide` | 34,442 | 12,378 |
| `drizzle-orm@1.0.0-rc.4` `effect-d1` `makeWithDefaults` + `@effect/sql-d1@4.0.1` + `Effect.runPromise` (`cloudflare:workers` external) | 210,327 | 67,526 |

The third number is the whole effect-d1 module graph in an otherwise empty program. It overlaps Drizzle code this app already ships via `drizzle-orm/d1`. The incremental bytes on top of the current Worker were not measured. A differential `wrangler deploy --dry-run` of this app was not run.

Alchemy was not esbuilt. The `alchemy@2.0.0-beta.81` install did not finish in this session, so there is no measurement of `import "alchemy/Cloudflare"` inside a Worker. The SvelteKit docs say `@alchemy.run/frontend-frameworks` is build-time only. Whether the generated `_worker.js` contains Effect or Alchemy runtime code is unresolved. If Alchemy is only the deploy CLI, its 134 MiB unpacked package is not a Worker cost. If handlers are written as Alchemy Effect Workers, that runtime cost is the unmeasured one.

---

## 8. Cloudflare limits and upstream Workers issues

### Limits that matter here

[Limits](https://developers.cloudflare.com/workers/platform/limits/) (last updated 2026-09-05):

- Worker size: 64 MiB uncompressed, Free and Paid. No compressed limit. Changelog: [2026-09-04](https://developers.cloudflare.com/changelog/post/2026-09-04-increased-worker-size-limit/) removed the old 3 MB / 10 MB gzip caps.
- Startup time: 1 second to parse and run global scope. Rejection text: `Script startup exceeded CPU time limit` (error `10021`). Guidance: do not do expensive work at top level.
- Memory: 128 MB per isolate.
- CPU per HTTP request: 10 ms on Free; Paid default 30 seconds, raisable to 5 minutes. Waiting on D1 does not count as CPU.
- This repo’s `wrangler.jsonc` does not set `limits.cpu_ms`.

The Effect startup issue below cites a 400 ms budget. That number is the reporter’s, against wrangler 4.127.1. It is not the figure on the current limits page.

### Effect on workerd

[Effect-TS/effect#6319](https://github.com/Effect-TS/effect/issues/6319) — **open**, labels `bug` and `3.0`, created 2026-07-12, updated 2026-07-28. Versions in the report: `effect@3.21.2`, `@effect/platform@0.96.1`. `HttpApp.toWebHandlerLayerWith` memoises layer build in a promise created inside the first request. workerd does not settle promises from an aborted request’s IoContext, so a cancelled cold start leaves every later request on that isolate hung (error 1101). This is the class of bug the August 2026 issue comment is pointing at. Effect 4 moved HTTP into the `effect` package (4.0.1 README). This note did not check whether `effect@4.0.1` still uses that memoisation.

[Effect-TS/effect#8038](https://github.com/Effect-TS/effect/issues/8038) — **closed** 2026-09-07. `effect@4.0.0-rc.112`. `Effect.fn` constructs an `Error` at each definition site; on workerd that cost scales with the enclosing function. The reporter’s padded module spent 410.7 ms of startup CPU on 1,600 definitions and started failing deploys. Linked workerd issue: [cloudflare/workerd#7245](https://github.com/cloudflare/workerd/issues/7245). Closing PRs named on the timeline: #8066 and #8114. This note did not re-benchmark 4.0.1.

[Effect-TS/effect#7927](https://github.com/Effect-TS/effect/pull/7927) describes moving HTTP layer construction to handler-creation time so Cloudflare module eval pays it before the first request, and says a minimal `HttpRouter` worker stayed at 283 KB (41 KB min+gzip) with no Schema graph retained. It also says layers that do I/O while building still cannot run in Worker global scope, because bindings are not available there. Treat the kilobyte figure as that PR’s claim, not as a measurement from this session.

[Effect-TS/effect#6006](https://github.com/Effect-TS/effect/issues/6006) — **open**, Durable Object SQLite transactions versus `BEGIN`/`COMMIT`. This app uses D1, not DO SQLite. Low relevance unless someone adopts `@effect/sql-sqlite-do`.

[Effect-TS/effect#6169](https://github.com/Effect-TS/effect/issues/6169) — **closed**. msgpack `new Function()` blocked at request time on Workers. v3 RPC. Irrelevant unless this app uses Effect RPC msgpack.

No first-party Effect page fetched for this note says “Workers are unsupported.” The 4.0 blog’s platform line is general (“broader native platform support”) and does not list workerd caveats. Alchemy’s Workers docs assume workerd.

### Alchemy issues

[alchemy-run/alchemy#886](https://github.com/alchemy-run/alchemy/issues/886) is closed and merged: SvelteKit (and Waku, Astro, Nuxt) as `Cloudflare.Website` resources. The issue text says bindings reach SvelteKit server routes via `platform.env`, and that the in-memory adapter does not use `@sveltejs/adapter-cloudflare`.

That `platform.env` instruction conflicts with current kit. [sveltejs/kit#16754](https://github.com/sveltejs/kit/pull/16754) merged 2026-08-28 (changeset: major on `@sveltejs/adapter-cloudflare`): bindings move from `platform.env` to `import { env } from "cloudflare:workers"`. This repo already did that (`src/lib/server/db/index.ts`, `README.md`). The live Alchemy SvelteKit page, fetched 2026-10-08, still shows `platform.env` and `App.Platform` ([SvelteKit](https://alchemy.run/cloudflare/frontend/sveltekit/)).

A full scan of open Alchemy issues was not completed. No new upstream issues were filed.

---

## Example repos

Fetched 2026-10-08. No public repo found that combines Cloudflare, Better Auth, Effect v4, Alchemy v2 beta, and SvelteKit. First-party examples split the stack. Third-party apps each drop at least one piece.

### First-party (`alchemy-run/alchemy` `main`)

[examples/cloudflare-website-sveltekit](https://github.com/alchemy-run/alchemy/tree/main/examples/cloudflare-website-sveltekit) is the official SvelteKit example. Last commit on that path, fetched 2026-10-08: `0a746c7c2c` on 2026-10-06, [feat(frontend-frameworks): support SvelteKit 3.0 stable (#2060)](https://github.com/alchemy-run/alchemy/commit/0a746c7c2c). That commit moves the workspace catalog from `@sveltejs/kit@3.0.0-next.27` to `@sveltejs/kit@3.0.0` and `svelte` to `^5.57.1`. The example `package.json` still depends on `alchemy`, `effect`, and `@sveltejs/kit` via workspace/catalog. It does not depend on `@sveltejs/adapter-cloudflare`.

`alchemy.run.ts` is `Alchemy.Stack` plus `yield* Cloudflare.Website.SvelteKit`. The app is a normal `load` in `src/routes/+page.server.ts` that reads `platform.env.GREETING`. No Effect in a route, no Better Auth, no remote functions. `vite.config.ts` only calls `sveltekit()` and says not to declare an adapter, because Alchemy injects its wrangler-free adapter into that plugin. #2060 drops the old `sveltekit({ alias: { $lib: "src/lib" } })` and adds a `package.json` import `#lib/*` instead. The fixture in the same commit treats a user-declared `adapter` as something that must throw if it runs, and updates in-process fallback generation from `new Server` / `set_building` to kit 3’s `configure({ building, manifest, env })`.

The README, unchanged by #2060, still says no `svelte.config.js`, no `@sveltejs/adapter-cloudflare`, no Wrangler, and that `env` reaches server routes through `platform.env`. The Kit 3.0 stable bump did not switch the example to `import { env } from "cloudflare:workers"`.

[examples/cloudflare-better-auth](https://github.com/alchemy-run/alchemy/tree/main/examples/cloudflare-better-auth). Depends on `@alchemy.run/better-auth`, `alchemy`, `better-auth`, `effect`, and `kysely`. Not SvelteKit. `src/auth.ts` builds a `Context.Service`. `src/worker.ts` is a `Cloudflare.Worker` whose `fetch` is an Effect, provided through `CloudflareD1`. The UI is a Bun-built script in `public/`, not a Svelte app. Companion to the [Better Auth tutorial](https://alchemy.run/better-auth/).

### Third-party

[acoyfellow/WORKBOT](https://github.com/acoyfellow/WORKBOT). `package.json` on `main`: `alchemy@^0.77.5`, `better-auth@1.3.34`, `drizzle-orm@^0.44.7`, `@sveltejs/kit@^2.48.5`, `@sveltejs/adapter-cloudflare@^7.2.4`, `@sveltejs/adapter-auto@^7.0.0`. SvelteKit 2, Better Auth, Drizzle, D1, remote functions, Alchemy v1. No Effect. Scripts are `alchemy dev` / `alchemy deploy`, and the Cloudflare adapter is still a dependency.

[acoyfellow/lab](https://github.com/acoyfellow/lab). Root `bun.lock` / `package.json` on `main`: `alchemy@^0.91.2`, `effect@4.0.0-beta.51`, `better-auth@1.6.4`, `@sveltejs/kit@2.55.0`, `@sveltejs/adapter-cloudflare@7.2.8`. SvelteKit plus Effect v4 beta plus Better Auth plus Cloudflare, still Alchemy v1 and the official adapter. README puts Effect in the Worker and the `@acoyfellow/lab/effect` client, not in Kit remote functions.

[kamp-us/phoenix](https://github.com/kamp-us/phoenix). README: one Cloudflare Worker on alchemy `2.0.0-beta.45` plus Effect, auth via `@alchemy.run/better-auth` on D1. Frontend is React 19, not SvelteKit. [.patterns/better-auth-with-plugins-on-d1.md](https://github.com/kamp-us/phoenix/blob/main/.patterns/better-auth-with-plugins-on-d1.md) says they forked the upstream `CloudflareD1` layer: it calls `makeBetterAuth({database, secret})` with no plugin slot, declares its own D1, and does not wire `baseURL` / `trustedOrigins`. The fork caches `makeBetterAuth` once per isolate with `Effect.cached`.

[RATIU5/sveltekit-effect-runtime](https://github.com/RATIU5/sveltekit-effect-runtime) `1.3.0`. Peers: `effect@^4.0.0-beta.76`, `@sveltejs/kit@^2.50.2`. Wraps SvelteKit `query` / `command` / `form` around one `ManagedRuntime`, with a fresh layer per remote call. No Alchemy, no Better Auth, no Cloudflare.

[alchemy-run/alchemy#1216](https://github.com/alchemy-run/alchemy/issues/1216) is Alchemy v1, not v2. The reporter set `adapter: alchemy()` from `alchemy/cloudflare/sveltekit` in `svelte.config.js` and constructed Better Auth from `event.platform.env`. Fallback-page generation returned status 500. A comment’s workaround was Alchemy’s adapter in dev and `@sveltejs/adapter-cloudflare` in prod. The maintainer asked whether it still failed on Alchemy 0.85.2 or later.

---

## Sources

- This repo: `package.json`, `wrangler.jsonc`, `vite.config.ts`, `src/lib/auth.server.ts`, `src/lib/server/db/index.ts`, `src/lib/server/db/create-db.ts`, `src/hooks.server.ts`, `src/lib/features/*/*.remote.ts`, `docs/remote-functions-migration.md`, `README.md`, installed `drizzle-orm@1.0.0-rc.4` and `@better-auth/drizzle-adapter@1.7.7`.
- Effect: https://effect.website/blog/releases/effect/40 · https://effect.website/blog/effect-v4-rc-september-recap · https://effect.website/docs/v4/api/effect/Context · https://effect.website/docs/v4/api/effect/Layer · https://effect.website/docs/v4/runtime · npm `effect@4.0.1`.
- Alchemy: https://alchemy.run/what-is-alchemy · https://alchemy.run/cloudflare/frontend/sveltekit/ · https://alchemy.run/better-auth/ · https://alchemy.run/providers/betterauth/cloudflared1 · https://github.com/alchemy-run/alchemy/issues/886 · https://github.com/alchemy-run/alchemy/issues/1216 · https://github.com/alchemy-run/alchemy/tree/main/examples/cloudflare-website-sveltekit · https://github.com/alchemy-run/alchemy/tree/main/examples/cloudflare-better-auth · npm `alchemy@2.0.0-beta.81`. The older https://alchemy.run/guides/cloudflare-sveltekit/ is still online and describes the pre-v2 API.
- Example apps: https://github.com/acoyfellow/WORKBOT · https://github.com/acoyfellow/lab · https://github.com/kamp-us/phoenix · https://github.com/kamp-us/phoenix/blob/main/.patterns/better-auth-with-plugins-on-d1.md · https://github.com/RATIU5/sveltekit-effect-runtime.
- Better Auth: https://better-auth.com/blog/1-5 · https://better-auth.com/docs/1.6/installation · https://better-auth.com/docs/concepts/database · https://github.com/better-auth/better-auth/issues/10315 · https://github.com/better-auth/better-auth/issues/969.
- Varlock: https://varlock.dev/plugins/effect/ · https://varlock.dev/integrations/vite/ · https://varlock.dev/integrations/sveltekit/ · https://varlock.dev/integrations/cloudflare/ · https://varlock.dev/guides/encrypted-deployments/ · npm `@varlock/effect-plugin@0.1.0`.
- Drizzle: installed package exports; https://orm.drizzle.team/docs/sqlite/connect-cloudflare-d1 · https://orm.drizzle.team/docs/connect-effect-postgres · https://orm.drizzle.team/docs/sqlite/effect-schema · https://github.com/drizzle-team/drizzle-orm/releases/tag/v1.0.0-rc.1 · npm `@effect/sql-d1@4.0.1`.
- Effect Schema: https://effect.website/docs/v4/schema/standard-schema · https://effect.website/docs/v4/api/effect/Schema. This repo: `valibot@1.5.0`, `drizzle-orm/valibot` in feature `schemas.server.ts`, Valibot schemas passed to remote `query`.
- SvelteKit: https://svelte.dev/docs/kit/remote-functions · https://github.com/sveltejs/kit/pull/16754 · https://github.com/sveltejs/kit/issues/17271.
- Cloudflare: https://developers.cloudflare.com/workers/platform/limits/ · https://developers.cloudflare.com/changelog/post/2026-09-04-increased-worker-size-limit/.
- Effect Workers issues: https://github.com/Effect-TS/effect/issues/6319 · https://github.com/Effect-TS/effect/issues/8038 · https://github.com/Effect-TS/effect/pull/7927 · https://github.com/Effect-TS/effect/issues/6006 · https://github.com/Effect-TS/effect/issues/6169.
