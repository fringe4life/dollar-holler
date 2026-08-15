# Dollar Holler

<div align="center">

[![SvelteKit](https://img.shields.io/badge/SvelteKit-3.0.0--next.23-orange?logo=svelte&logoColor=white)](https://kit.svelte.dev/) [![Svelte](https://img.shields.io/badge/Svelte-5.56.8-red?logo=svelte&logoColor=white)](https://svelte.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-1.0.0--rc.4-green?logo=sqlite&logoColor=white)](https://orm.drizzle.team/) [![Better Auth](https://img.shields.io/badge/Better%20Auth-1.7.0--rc.5-purple?logo=auth0&logoColor=white)](https://www.better-auth.com/) [![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/workers/) [![D1](https://img.shields.io/badge/D1-SQLite-F38020?logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/d1/) [![Panda CSS](https://img.shields.io/badge/Panda%20CSS-2.0.0--beta.13-16A34A?logo=css3&logoColor=white)](https://panda-css.com/) [![Sentry](https://img.shields.io/badge/Sentry-10.70.0-362D59?logo=sentry&logoColor=white)](https://sentry.io/)

</div>

A modern invoice management application built with SvelteKit 3 (pre-release) and Svelte 5, featuring Better Auth authentication, Drizzle ORM on Cloudflare D1 (SQLite), Sentry error monitoring, and UUIDv7 for resilient cursor-friendly IDs.

## Prerequisites

- [Bun](https://bun.sh/) (required)
- [Cloudflare](https://developers.cloudflare.com/) account (Workers + D1) for deploy; local D1 works via Wrangler without a remote database

## Getting Started

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd dollar-holler
   bun install
   ```

2. **Set up environment variables ([Varlock](https://varlock.dev/)):** The committed [`.env.schema`](./.env.schema) is the source of truth for variable names, validation, and (optional) [Bitwarden Secrets Manager](https://bitwarden.com/products/secrets-manager/) lookups.
   - **Bun:** [`bunfig.toml`](./bunfig.toml) sets `env = false` and `preload = ["varlock/auto-load"]` so Bun does not load `.env` on its own before Varlock (see [Varlock + Bun](https://varlock.dev/integrations/bun/)). A 3-day `minimumReleaseAge` is enabled; `@sveltejs/kit` and `@sveltejs/adapter-cloudflare` are listed in `minimumReleaseAgeExcludes` when upgrading early.
   - **Vite / SvelteKit:** [`vite.config.ts`](./vite.config.ts) uses `@varlock/vite-integration` with `ssrInjectMode: "resolved-env"` ([Varlock + Vite](https://varlock.dev/integrations/vite/)).
   - **Bitwarden:** Install the app deps (already in `package.json`), then in Bitwarden Secrets Manager create a **machine account**, copy its **access token** once, and grant it read access to the secrets you need. Put the token in a **gitignored** file such as `.env.local` as `BITWARDEN_ACCESS_TOKEN=...`. In `.env.schema`, replace the placeholder UUIDs in `bitwarden("...")` with your real secret IDs ([Bitwarden plugin](https://varlock.dev/plugins/bitwarden/)).
   - **Without Bitwarden (e.g. quick local setup):** Set `BETTER_AUTH_SECRET`, `PUBLIC_BASE_URL`, and `SENTRY_AUTH_TOKEN` (Sentry auth token used by the Vite plugin for releases when `mode !== "development"`) in `.env` or `.env.local` with literal values instead of `bitwarden(...)` where applicable. Host and CI variables still override resolved values when set. Optional `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_D1_DATABASE_ID`, and `CLOUDFLARE_API_TOKEN` are only for drizzle-kit `studio` / `push` against remote D1.
   - **Types:** After changing `.env.schema`, run `bun run env:typegen` to refresh [`src/env-varlock.d.ts`](./src/env-varlock.d.ts).

   The app resolves configuration from Varlock (`import { ENV } from "varlock/env"`) for Drizzle Kit ([`drizzle.config.ts`](./drizzle.config.ts)) and auth ([`src/lib/auth.server.ts`](./src/lib/auth.server.ts)). Runtime D1 uses the Wrangler `DB` binding (`event.platform.env.DB`), not env URLs.

3. **Set up the database:** Drizzle Kit generates SQL under `./src/lib/server/db/migrations`; [`scripts/flatten-d1-migrations.ts`](./scripts/flatten-d1-migrations.ts) copies those into Wrangler-numbered files under `./src/lib/server/db/d1`. Local/remote apply uses Wrangler. Put the real D1 UUID from `wrangler d1 create dollar-holler` into [`wrangler.jsonc`](./wrangler.jsonc) before remote migrate/deploy.

   ```bash
   # Generate Drizzle migrations and flatten for Wrangler
   bun run db:generate

   # Apply to local D1 (Miniflare / `.wrangler`)
   bun run db:migrate

   # Apply to remote D1 (needs a real database_id in wrangler.jsonc)
   bun run db:migrate:remote

   # Optional: drizzle-kit push/studio via D1 HTTP (needs CLOUDFLARE_* vars)
   bun run db:push
   bun run db:studio

   # Seed local D1 via Wrangler platform proxy (create users via Better Auth first)
   bun run db:seed

   # Seed remote Cloudflare D1 (same wipe of clients/invoices/line items/settings)
   bun run db:seed:remote
   ```

4. **Start the development server:**

   ```bash
   bun run dev
   ```

5. **Optional: Preview production build**
   ```bash
   bun run build && bun run preview
   ```

## Available Scripts

- `bun run dev` - Start development server (Vite 8)
- `bun run build` - Build for production (`svelte-kit sync`, `panda build`, view-transition ESM patch, then Vite)
- `bun run panda:build` - Sync, `panda build`, and view-transition ESM patch only
- `bun run preview` - Preview production build
- `bun run lint` - Run ESLint
- `bun run lint:fix` - Run ESLint with auto-fix
- `bun run format` - Format with Prettier
- `bun run format:check` - Check Prettier formatting
- `bun run stylelint` - Lint CSS under `src/**/*.css`
- `bun run check` - ESLint, Prettier check, Stylelint, then `svelte-check`
- `bun run check:watch` - `svelte-kit sync` then `svelte-check --watch`
- `bun run tsc` - Type-check with native TypeScript 7 preview (`@typescript/native`)
- `bun run tsc6` - Type-check with TypeScript 6
- `bun run fix` - `lint:fix`, `format`, and Stylelint with `--fix`
- `bun run env:typegen` - Regenerate types from `.env.schema` (Varlock)
- `bun run db:generate` - Generate Drizzle migrations and flatten into Wrangler D1 SQL
- `bun run db:migrate` - Apply D1 migrations locally (`wrangler d1 migrations apply --local`)
- `bun run db:migrate:remote` - Apply D1 migrations to remote
- `bun run db:seed` - Seed local D1 via Wrangler `getPlatformProxy` (Varlock `run`)
- `bun run db:seed:remote` - Seed remote Cloudflare D1 via Node (`tsx` + `getPlatformProxy` + D1 `remote: true`; bun hangs; wrangler login)
- `bun run db:studio` - Open Drizzle Studio (D1 HTTP; needs `CLOUDFLARE_*`)
- `bun run db:push` - Push schema to remote D1 (D1 HTTP; needs `CLOUDFLARE_*`)
- `bun run cf:types` - Generate Wrangler `Env` types (`src/worker-configuration.d.ts`, gitignored)
- `bun run deploy` - Production build then `wrangler deploy`
- `bun run fallow:prepare` - Sync, `panda build`, and view-transition ESM patch (run before Fallow if you invoke the CLI directly; other `fallow:*` scripts call this automatically)
- `bun run fallow` - Full Fallow analysis (after prepare)
- `bun run fallow:dead-code` - Dead code analysis (after prepare)
- `bun run fallow:boundaries` - List configured boundaries
- `bun run fallow:boundary-violations` - Dead-code with boundary violations
- `bun run fallow:dupes` - Fallow duplicate detection
- `bun run prepare` (auto) - `svelte-kit sync` and Husky after install

## Tech Stack

- **Framework:** SvelteKit 3 (`3.0.0-next.23`) with `@sveltejs/adapter-cloudflare` 8 (`8.0.0-next.6`) and Svelte 5 runes (experimental `remoteFunctions`, async compiler, server instrumentation and tracing in [`vite.config.ts`](./vite.config.ts)); list query updates use shallow `goto(..., { shallow: true })` and `page.shallow?.url` via [`visibleListUrl`](./src/lib/features/pagination/utils/url.ts)
- **Observability:** [Sentry](https://sentry.io/) 10.70 on server ([`src/hooks.server.ts`](./src/hooks.server.ts) `initCloudflareSentryHandle` + `sentryHandle`, flush via `platform.ctx.waitUntil`) and client ([`src/hooks.client.ts`](./src/hooks.client.ts)); `sentrySvelteKit` Vite plugin in [`vite.config.ts`](./vite.config.ts) for releases when `SENTRY_AUTH_TOKEN` is set
- **Data layer:** SvelteKit remote functions (`query` / `command` / `form`) in [`src/lib/features/*/*.remote.ts`](./src/lib/features); pages `await` queries inside `<svelte:boundary>` (see [`docs/remote-functions-migration.md`](./docs/remote-functions-migration.md)). List/detail mutations use `.updates()` for optimistic cache (clients/invoices). Auth forms including logout in [`auth.remote.ts`](./src/lib/features/auth/auth.remote.ts). Better Auth HTTP remains at `/api/auth` via `svelteKitHandler` in [`src/hooks.server.ts`](./src/hooks.server.ts).
- **Database:** [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite at the edge)
- **ORM:** Drizzle ORM 1.0 (rc.4) with `drizzle-orm/d1`; per-request client from `event.platform.env.DB` ([`src/lib/server/db/index.ts`](./src/lib/server/db/index.ts)); Drizzle Kit `dialect: "sqlite"` + optional `d1-http`
- **Authentication:** Better Auth 1.7 (`1.7.0-rc.5`) with email/password ([`src/lib/auth.server.ts`](./src/lib/auth.server.ts), Drizzle adapter `provider: "sqlite"`, `advanced.database.joins`, `allowedHosts` for `localhost`, `*.workers.dev`, and `*.pages.dev`, `@better-auth/drizzle-adapter` relations-v2); login/signup/forgot/reset/change-password/logout via remote forms (logout `redirect`s to login); account rows keyed by `(issuer, account_id)` (credentials use `local:credential`)
- **ID generation:** UUIDv7 via the [`uuidv7`](https://github.com/LiosK/uuidv7) package, wrapped in [`create-id.ts`](./src/lib/server/utils/create-id.ts) (cursor-friendly IDs, used by Drizzle defaults and Better Auth `generateId`)
- **Rich text:** Notes and terms accept Markdown; rendered HTML is sanitized server-side with [`marked`](https://marked.js.org/) and [`sanitize-html`](https://github.com/apostrophecms/sanitize-html) ([`markdown.server.ts`](./src/lib/utils/markdown.server.ts)) and persisted alongside the source in [`invoice_notes_html` / `invoice_terms_html`](./src/lib/server/db/schema.ts)
- **Deployment:** Cloudflare Workers + static assets (`@sveltejs/adapter-cloudflare` 8); [`wrangler.jsonc`](./wrangler.jsonc) sets `nodejs_compat`, D1 binding `DB`, and `ASSETS`
- **Package manager:** Bun
- **Validation:** ArkType for runtime-safe form validation
- **Bundler:** Vite 8.2.1 for dev and production builds (Rolldown)
- **Devtools:** [`@vitejs/devtools`](https://devtools.vite.dev/) + [`vite-devtools-svelte`](https://www.npmjs.com/package/vite-devtools-svelte) in [`vite.config.ts`](./vite.config.ts) (Svelte panels + Rolldown build analysis); Chrome workspace mapping via `vite-plugin-devtools-json` (separate from Vite DevTools); optional bundle treemap via `rollup-plugin-visualizer` (`stats.html`)
- **UI components:** [Ark UI for Svelte](https://ark-ui.com/) (`@ark-ui/svelte`)
- **Styling:** [Panda CSS](https://panda-css.com/) 2.0 (`2.0.0-beta.13`) with generated `styled-system` via `panda build` (see `panda.config.ts`, PostCSS); `_supportsBaseSelect` styles customizable `<select>` (`appearance: base-select`) with native fallback; search uses Panda `viewTransition()` bags, typed pagination VT stays in colocated `<style>` blocks; [Source Sans 3 Variable](https://fontsource.org/fonts/source-sans-3) via `@fontsource-variable/source-sans-3`
- **Lint/format:** ESLint 10 with TypeScript ESLint and eslint-plugin-svelte ([`eslint.config.mjs`](./eslint.config.mjs)), Prettier 3 with prettier-plugin-svelte ([`prettier.config.mjs`](./prettier.config.mjs)), Stylelint 17 for CSS ([`stylelint.config.mjs`](./stylelint.config.mjs))

## Project Structure

```
src/
├── hooks.server.ts          # Sentry handle, Better Auth session, route guards, font preload
├── hooks.client.ts          # Sentry client init and handleError
├── instrumentation.server.ts # Sentry server init (Kit experimental instrumentation)
├── lib/
│   ├── auth.server.ts       # Centralized Better Auth configuration (Drizzle adapter, UUIDv7 IDs)
│   ├── server/
│   │   ├── db/
│   │   │   ├── index.ts     # Per-request D1 drizzle (`getDb` / `db` proxy)
│   │   │   ├── create-db.ts # `createDb(d1)` (seed + request path)
│   │   │   ├── schema.ts    # Drizzle sqlite tables (auth + app)
│   │   │   ├── types.ts     # Status unions (client/invoice)
│   │   │   ├── relations.ts # Drizzle relations v2 (`defineRelations`)
│   │   │   ├── seed.ts      # Local D1 seed via Wrangler platform proxy
│   │   │   ├── migrations/  # Drizzle Kit folder migrations
│   │   │   └── d1/          # Flattened SQL for `wrangler d1 migrations apply`
│   │   └── utils/           # create-id (UUIDv7), invoice-notes-terms-html, invoice-status-transitions, errors
│   ├── client/            # Client-only: @attach helpers (dialogController, swipe), CSS.supports (base-select), shared runes (ItemPanel, Toggle, etc.)
│   ├── features/          # Domain features: components, remotes, schemas, Drizzle helpers
│   │   ├── auth/          # auth.remote.ts (Kit remote forms including logout), require-user.server.ts
│   │   ├── clients/       # clients.remote.ts, list/write/options queries
│   │   ├── invoices/      # invoices.remote.ts, list/detail/write queries
│   │   ├── landing-page/  # Marketing sections, nav, copy constants
│   │   ├── line-items/    # line-items.remote.ts
│   │   ├── pagination/    # PaginatedList, search, blank states, cursor list-query helpers
│   │   └── settings/      # settings.remote.ts
│   ├── components/        # Shared UI (Form remote binding, Modal, navbar/, icons, ui/)
│   ├── styles.ts          # Shared class names / style recipes
│   └── utils/
├── routes/
│   ├── (auth)/            # Login, signup, forgot/reset password (remote forms; logout is navbar form)
│   ├── (dashboard)/       # Navbar layout; invoice detail uses +layout@.svelte to skip it
│   │   ├── clients/
│   │   ├── invoices/      # List, thanks, [id] detail (layout reset to root)
│   │   └── settings/
│   ├── +layout.svelte
│   └── +page.svelte       # Landing page
└── app.html
```

## Database Schema

The application uses the following main tables:

- `user` - Better Auth user accounts
- `session` - User sessions
- `account` - Auth provider accounts; identity is unique `(issuer, account_id)` (email/password: `issuer` = `local:credential`, `account_id` = user id); index `(user_id)` and unique `(issuer, account_id)`
- `verification` - Email verification tokens
- `clients` - Client information (`client_status`: active, archive); index `(user_id, id)` for cursor lists
- `invoices` - Invoice records (`invoice_status`: draft, sent, paid; optional discount; markdown `notes` / `terms` plus precomputed sanitized `notes_html` / `terms_html`); indexes `(user_id, id)` and `(user_id, client_id, id)`
- `line_items` - Invoice line items; index `(invoice_id)` for list subtotal subqueries
- `settings` - User settings (`user_id` primary key)

Primary keys are `text` columns; IDs are UUIDv7 strings from [`createId`](./src/lib/server/utils/create-id.ts) (uuidv7 package), including Better Auth `generateId` in [`src/lib/auth.server.ts`](./src/lib/auth.server.ts). Domain list indexes match UUIDv7 cursor pagination (`user_id` + `id`). Foreign keys use cascade deletes; D1 enables FK enforcement by default.

The application uses Drizzle's relations v2 (`defineRelations`) to simplify nested queries (e.g., `db.query.invoices.findMany({ with: { client: true, lineItems: true } })`) and avoid manual joins in remote helpers.

## Features

- **Error monitoring:** Sentry on server and client with Kit instrumentation
- **Modern Authentication:** Better Auth 1.7 with email/password; account identity scoped by `(issuer, account_id)`
- **Remote functions:** Dashboard lists, detail, settings, and mutations via SvelteKit `query` / `command` / `form`; `.updates()` optimistic cache on client/invoice writes and deletes; auth including logout; pages `await` queries inside `<svelte:boundary>`
- **Type-Safe Database:** Drizzle ORM with full TypeScript support
- **Serverless Ready:** Cloudflare Workers + D1 binding (no outbound DB URL)
- **Resilient IDs:** UUIDv7 (uuidv7 package) for cursor-based navigation and performance
- **Safe rich text:** Markdown notes/terms sanitized server-side and stored as both source and HTML
- **Recent Data:** Seed script generates realistic data from the last 6 months
- **Multi-User Support:** Data is distributed randomly among users
- **Auth Flows:** Forgot and reset password supported; reset token read from URL and validated; logout remote form redirects to login (no empty `/logout` page)
- **Customizable selects:** Native `<select>` with CSS `appearance: base-select` when supported ([`Select.svelte`](./src/lib/components/ui/select/Select.svelte)); fallback is a plain select
- **Modern UI:** Ark UI components with Panda CSS
- **Svelte 5 Runes:** Uses @attach directives and reactive patterns
- **Row menus:** Invoice additional options use the native Popover API with CSS anchor positioning
- **Responsive Design:** Mobile-first with swipe gestures

## Deployment

The application deploys to Cloudflare Workers with static assets. [`wrangler.jsonc`](./wrangler.jsonc) names the worker `dollar-holler`, enables `nodejs_compat`, binds D1 as `DB`, and points `assets` at `.svelte-kit/cloudflare`.

```bash
bun run deploy
```

- **Platform env:** With `ssrInjectMode: "resolved-env"`, Varlock secrets are resolved at build time and baked into the worker. Set `BITWARDEN_ACCESS_TOKEN` so the build can resolve `bitwarden(...)` entries in [`.env.schema`](./.env.schema), and set `PUBLIC_BASE_URL` to your deployment URL (not the localhost default). Add `SENTRY_AUTH_TOKEN` if you use the Sentry Vite plugin for release uploads. Replace the placeholder `database_id` in `wrangler.jsonc` after `wrangler d1 create dollar-holler`. Better Auth `allowedHosts` covers `*.workers.dev` preview hostnames so sign-in works without changing `PUBLIC_BASE_URL` per deploy.

## Notes

- Uses Vite 8.2.1 (`vite` in `package.json`) and Varlock 1.16 (`@varlock/bitwarden-plugin` 2.x). Varlock’s Vite plugin uses `ssrInjectMode: "resolved-env"`. Production builds use `rolldownOptions` in `vite.config.ts` (`dropConsole`, `devtools: {}` for Rolldown analysis metadata). Dev: `svelteDevtools()` before `sveltekit()`, then `DevTools()` from `@vitejs/devtools`. Optional Cursor MCP for live Svelte metrics: [`.cursor/mcp.json`](./.cursor/mcp.json) points at `http://localhost:5173/__svelte-devtools/mcp` with `SVELTE_DEVTOOLS_TOKEN` from the token printed when `bun run dev` starts (rotates each restart). Local D1 persist lives under `.wrangler/` (gitignored).
- Lint and format run through ESLint, Prettier, and Stylelint (`bun run check`, `bun run fix`). ESLint ignores generated paths (`styled-system/`, `.svelte-kit/`) and defers CSS to Stylelint.
- [Fallow](https://docs.fallow.tools) resolves `styled-system/*` imports from the generated Panda output and `#lib` path aliases (including `.svelte` → `.svelte.ts` modules). `#features/*` is listed in `ignoreUnresolvedImports` in [`.fallowrc.json`](./.fallowrc.json). Feature `*.server.ts` files live in a `features-server` zone so remotes can import `require-user.server.ts` without crossing into `src/lib/server/**`. Run `bun run fallow:prepare` (or any `fallow:*` script) so `styled-system/` exists before analysis; the folder is gitignored and is recreated by `panda build`.
- Panda CSS 2.0 (`2.0.0-beta.13`) generates `styled-system/` via `panda build`. Root [`tsconfig.json`](./tsconfig.json) extends `$app/tsconfig` and declares `paths` for `#lib`, `#features`, and `styled-system` (also in `package.json` `imports`). [`vite.config.ts`](./vite.config.ts) sets `resolve.tsconfigPaths: true` and a `styled-system` `resolve.alias` because Rolldown can miss tsconfig paths for some `.svelte` virtual-module importers. After `panda build`, [`scripts/fix-panda-view-transition-esm.ts`](./scripts/fix-panda-view-transition-esm.ts) ensures `viewTransition` exports are available (beta codegen gap). Typed pagination view-transition CSS lives in `PaginatedList.svelte`; `removeUnusedKeyframes` is off in `panda.config.ts` so theme keyframes named only from raw CSS are retained. Run `panda build` explicitly (via `bun run build`, `bun run panda:build`, or Fallow prepare) when `styled-system/` is missing.
- SvelteKit 3 uses `$app/env` (not `$app/environment`) for `building` / `dev` in server code. Typed routes use filesystem route IDs with `resolve()` (for example `/(dashboard)/invoices/[id]`). `kit.alias` is deprecated in favor of tsconfig paths / package.json `#` imports. Static assets use `$app/paths` `asset("images/...")` without a leading slash. Shallow list navigations use `goto(url, { shallow: true })` (not deprecated `pushState`).
- The project uses Svelte 5's `@attach` directive for modern component patterns and the Spring class for smooth animations.
- Better Auth is configured in `auth.server.ts` to use UUIDv7 (uuidv7 package) for user ID generation and includes session caching for performance. After upgrading to 1.7 rc.4+, run the account identity migration under `src/lib/server/db/d1/` (rc.4 restores `account_id`; unique key remains `(issuer, account_id)`) before signing in against an existing database.
- Invoice `notes` and `terms` accept Markdown; create/update remotes derive sanitized HTML via [`invoice-notes-terms-html.server.ts`](./src/lib/server/utils/invoice-notes-terms-html.server.ts) only after auth / ownership checks.
- SvelteKit configuration lives in the `sveltekit()` Vite plugin in `vite.config.ts` (`@sveltejs/adapter-cloudflare` 8, preprocess, Svelte 5 async compiler option, `experimental.remoteFunctions`, tracing/server instrumentation for Sentry). Wrangler `platformProxy.persist` keeps local D1 across `bun run dev`.
- ArkType on Workers: [`src/lib/utils/arktype.config.ts`](./src/lib/utils/arktype.config.ts) sets `jitless: true` (workerd blocks `new Function`). Import that module **before** `arktype` / `drizzle-orm/arktype`. Vite SSR plugin `arktype-jitless` injects the import if a new file forgets it.

## License

MIT
