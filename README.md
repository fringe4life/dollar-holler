# Dollar Holler

<div align="center">

[![SvelteKit](https://img.shields.io/badge/SvelteKit-3.0.0-orange?logo=svelte&logoColor=white)](https://kit.svelte.dev/) [![Svelte](https://img.shields.io/badge/Svelte-5.57.1-red?logo=svelte&logoColor=white)](https://svelte.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-1.0.0--rc.4-green?logo=sqlite&logoColor=white)](https://orm.drizzle.team/) [![Better Auth](https://img.shields.io/badge/Better%20Auth-1.7.6-purple?logo=auth0&logoColor=white)](https://www.better-auth.com/) [![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/workers/) [![D1](https://img.shields.io/badge/D1-SQLite-F38020?logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/d1/) [![Panda CSS](https://img.shields.io/badge/Panda%20CSS-2.1.0-16A34A?logo=css3&logoColor=white)](https://panda-css.com/) [![Sentry](https://img.shields.io/badge/Sentry-11.0.0-362D59?logo=sentry&logoColor=white)](https://sentry.io/)

</div>

A modern invoice management application built with SvelteKit 3 and Svelte 5, featuring Better Auth authentication, Drizzle ORM on Cloudflare D1 (SQLite), Sentry error monitoring, light/dark/system color mode, and UUIDv7 for resilient cursor-friendly IDs.

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
   - **Bun:** [`bunfig.toml`](./bunfig.toml) sets `env = false` and `preload = ["varlock/auto-load"]` so Bun does not load `.env` on its own before Varlock (see [Varlock + Bun](https://varlock.dev/integrations/bun/)). Isolated `linker`, 3-day `minimumReleaseAge`; `minimumReleaseAgeExcludes` is empty now that Kit 3 and Panda 2.1 are stable.
   - **Vite / SvelteKit:** [`vite.config.ts`](./vite.config.ts) uses `@varlock/vite-integration` with `ssrInjectMode: "resolved-env"` ([Varlock + Vite](https://varlock.dev/integrations/vite/)).
   - **Bitwarden:** Install the app deps (already in `package.json`), then in Bitwarden Secrets Manager create a **machine account**, copy its **access token** once, and grant it read access to the secrets you need. Put the token in a **gitignored** file such as `.env.local` as `BITWARDEN_ACCESS_TOKEN=...`. In `.env.schema`, replace the placeholder UUIDs in `bitwarden("...")` with your real secret IDs ([Bitwarden plugin](https://varlock.dev/plugins/bitwarden/)).
   - **Without Bitwarden (e.g. quick local setup):** Set `BETTER_AUTH_SECRET`, `PUBLIC_BASE_URL`, and `SENTRY_AUTH_TOKEN` (Sentry auth token used by the Vite plugin for releases when `mode !== "development"`) in `.env` or `.env.local` with literal values instead of `bitwarden(...)` where applicable. Host and CI variables still override resolved values when set. Optional `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_D1_DATABASE_ID`, and `CLOUDFLARE_API_TOKEN` are only for drizzle-kit `studio` / `push` against remote D1.
   - **Types:** After changing `.env.schema`, run `bun run env:typegen` to refresh [`src/env-varlock.d.ts`](./src/env-varlock.d.ts).

   The app resolves configuration from Varlock (`import { ENV } from "varlock/env"`) for Drizzle Kit ([`drizzle.config.ts`](./drizzle.config.ts)) and auth ([`src/lib/auth.server.ts`](./src/lib/auth.server.ts)). Runtime D1 uses the Wrangler `DB` binding (`import { env } from "cloudflare:workers"`, `env.DB`), not env URLs. Adapter-cloudflare 8 next.7+ dropped `event.platform`.

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
- `bun run build` - Build for production (`svelte-kit sync`, `panda build`, then Vite)
- `bun run analyze` - Production build with `ANALYZE=true` (opens `stats.html` treemap)
- `bun run panda:build` - Sync and `panda build`
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
- `bun run test` - Run Bun unit tests (`*.test.ts`); [`bunfig.toml`](./bunfig.toml) `[test].preload` mocks `$app/env` via [`src/test/app-env-preload.ts`](./src/test/app-env-preload.ts)
- `bun run fix` - `lint:fix`, `format`, and Stylelint with `--fix`
- `bun run env:typegen` - Regenerate types from `.env.schema` (Varlock)
- `bun run db:generate` - Generate Drizzle migrations and flatten into Wrangler D1 SQL
- `bun run db:migrate` - Apply D1 migrations locally (`wrangler d1 migrations apply --local`)
- `bun run db:migrate:remote` - Apply D1 migrations to remote
- `bun run db:seed` - Seed local D1 via Wrangler `getPlatformProxy` (Varlock `run`)
- `bun run db:seed:remote` - Seed remote Cloudflare D1 via Node (`tsx` + `getPlatformProxy` + D1 `remote: true`; bun hangs; wrangler login)
- `bun run db:studio` - Open Drizzle Studio (D1 HTTP; needs `CLOUDFLARE_*`)
- `bun run db:push` - Push schema to remote D1 (D1 HTTP; needs `CLOUDFLARE_*`)
- `bun run bench:sql-list` - Time local D1 invoice and client list SQL (throwaway harness)
- `bun run oracle:sql-list` - Check those SQL shapes against the golden oracle
- `bun run oracle:sql-list:write` - Rewrite the sql-list oracle golden fixture
- `bun run cf:types` - Generate Wrangler `Env` types (`src/worker-configuration.d.ts`, gitignored)
- `bun run cf:restore-workers` - Restore `cloudflare:workers` in `.svelte-kit/output/server` after `vite preview` (Wrangler `build.command`)
- `bun run deploy` - Production build then `wrangler deploy`
- `bun run deploy:project` - `wrangler deploy` only (no rebuild)
- `bun run fallow:prepare` - Sync and `panda build` (run before Fallow if you invoke the CLI directly; other `fallow:*` scripts call this automatically)
- `bun run fallow` - Full Fallow analysis (after prepare)
- `bun run fallow:dead-code` - Dead code analysis (after prepare)
- `bun run fallow:boundaries` - List configured boundaries
- `bun run fallow:boundary-violations` - Dead-code with boundary violations
- `bun run fallow:dupes` - Fallow duplicate detection
- `bun run prepare` (auto) - `svelte-kit sync` and Husky after install

## Tech Stack

- **Framework:** SvelteKit 3 (`3.0.0`) with `@sveltejs/adapter-cloudflare` 8 (`8.0.0`) and Svelte 5 runes (experimental `remoteFunctions`, async compiler, server instrumentation and tracing in [`vite.config.ts`](./vite.config.ts)); list query updates use shallow `goto(..., { shallow: true })` and `page.shallow?.url` via [`visibleListUrl`](./src/lib/features/pagination/utils/url.ts)
- **Observability:** [Sentry](https://sentry.io/) 11.0 on server ([`src/hooks.server.ts`](./src/hooks.server.ts) `initCloudflareSentryHandle` + `sentryHandle` + `handleErrorWithSentry`) and client ([`src/hooks.client.ts`](./src/hooks.client.ts)); Vite plugin from `@sentry/sveltekit/vite` in [`vite.config.ts`](./vite.config.ts) for releases when `SENTRY_AUTH_TOKEN` is set. [`@opentelemetry/api`](https://opentelemetry.io/) 1.9.1 is a direct dependency so Sentry tracing resolves at deploy and `vite preview`
- **Data layer:** SvelteKit remote functions (`query` / `command` / `form`) in [`src/lib/features/*/*.remote.ts`](./src/lib/features); pages `await` queries inside `<svelte:boundary>` (see [`docs/remote-functions-migration.md`](./docs/remote-functions-migration.md)). List/detail mutations use `.updates()` for optimistic cache (clients/invoices). Auth forms including logout in [`auth.remote.ts`](./src/lib/features/auth/auth.remote.ts). Better Auth HTTP remains at `/api/auth` via `svelteKitHandler` in [`src/hooks.server.ts`](./src/hooks.server.ts).
- **Database:** [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite at the edge)
- **ORM:** Drizzle ORM 1.0 (rc.4) with `drizzle-orm/d1`; per-request client from `cloudflare:workers` `env.DB` ([`src/lib/server/db/index.ts`](./src/lib/server/db/index.ts)); Drizzle Kit `dialect: "sqlite"` + optional `d1-http`
- **Authentication:** Better Auth 1.7 (`1.7.6`) with email/password ([`src/lib/auth.server.ts`](./src/lib/auth.server.ts) isolate-cached `getAuth()` so `drizzleAdapter` does not construct at import, Drizzle adapter `provider: "sqlite"`, `advanced.database.joins`, `allowedHosts` for `localhost`, `*.workers.dev`, `*.pages.dev`, and `dolla-holla.org`, `@better-auth/drizzle-adapter` relations-v2); login/signup/forgot/reset/change-password/logout via remote forms (logout `redirect`s to login); account rows keyed by `(provider_id, account_id)` (credentials: `provider_id` = `credential`, `account_id` = user id)
- **ID generation:** UUIDv7 via the [`uuidv7`](https://github.com/LiosK/uuidv7) package, wrapped in [`create-id.ts`](./src/lib/server/utils/create-id.ts) (cursor-friendly IDs, used by Drizzle defaults and Better Auth `generateId`)
- **Rich text:** Notes and terms accept Markdown. The invoice form paints a Prism 1.30 overlay on the editor ([`HighlightedTextarea.svelte`](./src/lib/components/patterns/form/HighlightedTextarea.svelte), [`highlight-markdown.ts`](./src/lib/components/patterns/form/highlight-markdown.ts) tokenizes markdown and emits escaped `span.token` only — not `Prism.highlight` / wrap-hook HTML). Persisted HTML is still sanitized server-side with [`marked`](https://marked.js.org/) and [`sanitize-html`](https://github.com/apostrophecms/sanitize-html) ([`markdown.server.ts`](./src/lib/utils/markdown.server.ts)) alongside the source in [`invoice_notes_html` / `invoice_terms_html`](./src/lib/server/db/schema.ts)
- **Deployment:** Cloudflare Workers + static assets (`@sveltejs/adapter-cloudflare` 8); [`wrangler.jsonc`](./wrangler.jsonc) sets `nodejs_compat`, D1 binding `DB`, `ASSETS`, and `build.command` `cf:restore-workers` so Wrangler does not ingest leftover `file://` stubs from `vite preview`
- **Package manager:** Bun
- **Validation:** Valibot for remote `form()` payloads and shared client/server schemas (Drizzle valibot for DB insert/select)
- **Bundler:** Vite 8.3.1 for dev and production builds (Rolldown); production minify keeps `dropConsole` and default Oxc mangling. Wrangler rebundle uses [`tsconfig.wrangler.json`](./tsconfig.wrangler.json) (`alwaysStrict: false`) so esbuild does not leave nested scopes sloppy ([#114](https://github.com/fringe4life/dollar-holler/issues/114))
- **Devtools:** [`@vitejs/devtools`](https://devtools.vite.dev/) + [`vite-devtools-svelte`](https://www.npmjs.com/package/vite-devtools-svelte) in [`vite.config.ts`](./vite.config.ts) (Svelte panels + Rolldown build analysis); Chrome workspace mapping via `vite-plugin-devtools-json` (separate from Vite DevTools); optional bundle treemap via `rollup-plugin-visualizer` (`stats.html`)
- **Toasts:** native `popover="manual"` tray with Panda CSS (Figma snackbar styles, top-center)
- **Styling:** [Panda CSS](https://panda-css.com/) 2.1 (`2.1.0`) with generated `styled-system` via `panda build`, plus `@pandacss/vite` (`pandacss({ transform: true })`) for CSS inject and static `css()` / `cva()` / pattern folds in `.ts` and `.svelte` (SFC transform from #3848; avoid keys that silent-bail folds — e.g. invalid `has:{svg}`, [panda#3853](https://github.com/chakra-ui/panda/issues/3853); do not pad buttons via `_icon` — it targets child `svg` and collapses Lucide icons under `border-box`; remaining runtime tracked in [#109](https://github.com/fringe4life/dollar-holler/issues/109)). [`panda.config.ts`](./panda.config.ts) composes `define*` modules under [`theme/`](./theme/) (`tokens`, `semanticTokens`, `conditions`, `keyframes`, `patterns`, `globalCss`). UI colors use semantic tokens (`background`, `foreground`, `surface`, …) with `_dark` values; `_dark` is class `.dark` plus `@media (prefers-color-scheme: dark)` on `:root:not(.light)`. Shared motion recipes `directionalArrow` / `buttonIcon` are `cva` in [`src/lib/styles.ts`](./src/lib/styles.ts); landing-nav scroll uses `css.keyframes()`. Layouts and forms prefer named `gridTemplateAreas` / `gridArea` (dashboard `nav`/`main`, auth `logo`/`form`, invoice detail, settings, client/invoice forms, line-item summary). Form inputs use `_ariaInvalid` / `_userInvalid`; `_supportsBaseSelect` styles customizable `<select>` (`appearance: base-select`) with native fallback and `_starting` on `selectedcontent` children; search uses Panda `viewTransition()` bags (dashed underline becomes a solid ring bar on focus, no focus outline); typed pagination and theme changes go through [`withViewTransition`](./src/lib/client/view-transition.ts) (`supportsViewTransition` in [`supports.ts`](./src/lib/client/supports.ts) uses `$app/env` `browser`); theme uses `:active-view-transition-type(theme-change)` (clears other `view-transition-name`s so the circle reveal is not contested) and `theme-circle-reveal` in [`src/app.css`](./src/app.css); typed pagination CSS stays in colocated `<style>` blocks; [Source Sans 3 Variable](https://fontsource.org/fonts/source-sans-3) via `@fontsource-variable/source-sans-3`
- **Lint/format:** ESLint 10 with TypeScript ESLint and eslint-plugin-svelte ([`eslint.config.mjs`](./eslint.config.mjs)), Prettier 3 with prettier-plugin-svelte ([`prettier.config.mjs`](./prettier.config.mjs)), Stylelint 17 for CSS ([`stylelint.config.mjs`](./stylelint.config.mjs))

## Project Structure

```
scripts/                   # D1 flatten, cloudflare:workers stub/restore for Vite SSR + Wrangler
theme/                     # Panda define* modules (tokens, semanticTokens, conditions, keyframes, patterns, globalCss)
src/
├── hooks.server.ts          # Sentry handle, Better Auth session, route guards, theme html stamp, font preload
├── hooks.client.ts          # Sentry client init, theme init, handleError
├── params.ts                # Kit 3 matchers (`uuid` via Valibot `cursorSchema`, `defineParams`)
├── lib/
│   ├── auth.server.ts       # Centralized Better Auth configuration (Drizzle adapter, UUIDv7 IDs)
│   ├── server/
│   │   ├── db/
│   │   │   ├── index.ts     # Per-request D1 drizzle (`cloudflare:workers` `env.DB`, `db` proxy)
│   │   │   ├── create-db.ts # `createDb(d1)` (seed + request path)
│   │   │   ├── schema.ts    # Drizzle sqlite tables (auth + app)
│   │   │   ├── types.ts     # Status unions (client/invoice)
│   │   │   ├── relations.ts # Drizzle relations v2 (`defineRelations`)
│   │   │   ├── seed.ts      # Local D1 seed via Wrangler platform proxy
│   │   │   ├── migrations/  # Drizzle Kit folder migrations
│   │   │   └── d1/          # Flattened SQL for `wrangler d1 migrations apply`
│   │   └── utils/           # create-id (UUIDv7), invoice-notes-terms-html, invoice-status-transitions, errors
│   ├── theme/             # light/dark/system cookie parse, html stamp, persist
│   ├── client/            # Client-only: @attach helpers (dialogController, swipe), CSS.supports (base-select, view transitions), withViewTransition, shared runes (ItemPanel upsert/create-edit, Toggle, etc.)
│   ├── features/          # Domain features: components, remotes, schemas, Drizzle helpers
│   │   ├── auth/          # auth.remote.ts (Kit remote forms including logout), require-user.server.ts
│   │   ├── clients/       # clients.remote.ts, list/write/options queries
│   │   ├── invoices/      # invoices.remote.ts, list/detail/write queries
│   │   ├── landing-page/  # Marketing sections, nav, copy constants
│   │   ├── line-items/    # line-items.remote.ts
│   │   ├── pagination/    # PaginatedList, search, blank states, cursor list-query helpers
│   │   └── settings/      # settings.remote.ts
│   ├── components/        # Shared UI: primitives (TableHeader, TableHeaderItem, select, Textarea), patterns (form/ FormPanel, Form + FormField, HighlightedTextarea Prism overlay, ModeSelect), RouteError, Modal, navbar/, icons
│   ├── styles.ts          # Shared class names / cva recipes (`directionalArrow`, `buttonIcon`)
│   └── utils/
├── routes/
│   ├── (auth)/            # Login, signup, forgot/reset password (remote forms; logout is navbar form)
│   ├── (dashboard)/       # Navbar layout; invoice detail uses +layout@.svelte to skip it
│   │   ├── clients/       # List, [id=uuid] detail
│   │   ├── invoices/      # List, thanks, [id=uuid] detail (`+layout@.svelte` reset to root; `paddingBlockEnd` keeps slide-in surface in scroll flow)
│   │   └── settings/
│   ├── +error.svelte      # Shared RouteError (status heading)
│   ├── +layout.svelte
│   └── +page.svelte       # Landing page
└── app.html
```

## Database Schema

The application uses the following main tables:

- `user` - Better Auth user accounts
- `session` - User sessions
- `account` - Auth provider accounts; identity is `(provider_id, account_id)` (email/password: `provider_id` = `credential`, `account_id` = user id); indexes `(provider_id, account_id)` and `(user_id)`
- `verification` - Email verification tokens
- `clients` - Client information (`client_status`: active, archive); index `(user_id, id)` for cursor lists
- `invoices` - Invoice records (`invoice_status`: draft, sent, paid; optional discount; markdown `notes` / `terms` plus precomputed sanitized `notes_html` / `terms_html`); indexes `(user_id, id)` and `(user_id, client_id, id)`
- `line_items` - Invoice line items; index `(invoice_id)` for list subtotal subqueries
- `settings` - User settings (`user_id` primary key)

Primary keys are `text` columns; IDs are UUIDv7 strings from [`createId`](./src/lib/server/utils/create-id.ts) (uuidv7 package), including Better Auth `generateId` in [`src/lib/auth.server.ts`](./src/lib/auth.server.ts). Domain list indexes match UUIDv7 cursor pagination (`user_id` + `id`). Foreign keys use cascade deletes; D1 enables FK enforcement by default.

The application uses Drizzle's relations v2 (`defineRelations`) to simplify nested queries (e.g., `db.query.invoices.findMany({ with: { client: true, lineItems: true } })`) and avoid manual joins in remote helpers.

## Features

- **Error monitoring:** Sentry on server and client with Kit instrumentation
- **Modern Authentication:** Better Auth 1.7 with email/password; isolate-cached auth instance per Worker (not import-time singleton); account identity scoped by `(provider_id, account_id)`
- **Remote functions:** Dashboard lists, detail, settings, and mutations via SvelteKit `query` / `command` / `form`; `.updates()` optimistic cache on client/invoice writes and deletes; auth including logout; pages `await` queries inside `<svelte:boundary>`
- **Type-Safe Database:** Drizzle ORM with full TypeScript support
- **Serverless Ready:** Cloudflare Workers + D1 binding (no outbound DB URL)
- **Resilient IDs:** UUIDv7 (uuidv7 package) for cursor-based navigation and performance
- **Safe rich text:** Markdown notes/terms with Prism overlay highlighting while editing; sanitized HTML stored alongside source (overlay HTML is never persisted)
- **Recent Data:** Seed script generates realistic data from the last 6 months
- **Multi-User Support:** Data is distributed randomly among users
- **Auth Flows:** Forgot and reset password supported; reset token read from URL and validated; logout remote form redirects to login (no empty `/logout` page)
- **Customizable selects:** Native `<select>` with CSS `appearance: base-select` when supported ([`Select.svelte`](./src/lib/components/primitives/select/Select.svelte)); `selectedcontent` children animate in via `_starting`; fallback is a plain select
- **Grid areas:** Dashboard, auth, invoice detail, settings, and form layouts place regions with named `gridTemplateAreas` / `gridArea` instead of column spans alone
- **Dark mode:** light / dark / system via `theme` cookie; SSR stamps `<html class>` in [`hooks.server.ts`](./src/hooks.server.ts); client `init()` plus first-paint script in [`app.html`](./src/app.html); [`ModeSelect`](./src/lib/components/patterns/ModeSelect.svelte) on landing, navbar, and settings; choice changes run a `theme-change` view transition (circle clip-path from the top-right) via [`withThemeViewTransition`](./src/lib/theme/theme.ts); while that type is active other named view transitions are cleared so the mobile menu is not contested; the reveal CSS applies only under `prefers-reduced-motion: no-preference`
- **Modern UI:** native popover toasts with Panda CSS
- **Svelte 5 Runes:** Uses `@attach` directives and reactive patterns; create/edit forms share `FormPanel` + `ItemPanel` (`attach` prop forwarded as `{@attach}` onto `Modal`)
- **Route matchers:** Client and invoice detail params use `[id=uuid]` (`src/params.ts`, Valibot UUIDv7); invalid ids 404 before load
- **Remote forms:** Shared `Form` / `FormField` / `FieldErrors` with per-field `issues()`; auth, clients, invoices, settings use `save*.fields.*.as()` defaults for edit mode; `LoaderButton` for pending submit width
- **Shared route errors:** `RouteError` used by root and detail `+error.svelte` pages
- **Row menus:** Invoice additional options use the native Popover API with CSS anchor positioning
- **Responsive Design:** Mobile-first with swipe gestures

## Deployment

The application deploys to Cloudflare Workers with static assets. [`wrangler.jsonc`](./wrangler.jsonc) names the worker `dollar-holler`, enables `nodejs_compat`, binds D1 as `DB`, points `assets` at `.svelte-kit/cloudflare`, and runs `bun run cf:restore-workers` as Wrangler `build.command` so a leftover Vite preview stub cannot break deploy. Custom domain is `dolla-holla.org` (`workers_dev` / `preview_urls` off).

```bash
bun run deploy
```

- **Platform env:** With `ssrInjectMode: "resolved-env"`, Varlock secrets are resolved at build time and baked into the worker. Set `BITWARDEN_ACCESS_TOKEN` so the build can resolve `bitwarden(...)` entries in [`.env.schema`](./.env.schema), and set `PUBLIC_BASE_URL` to your deployment URL (not the localhost default). Add `SENTRY_AUTH_TOKEN` if you use the Sentry Vite plugin for release uploads. Replace the placeholder `database_id` in `wrangler.jsonc` after `wrangler d1 create dollar-holler`. Better Auth `allowedHosts` covers `*.workers.dev` preview hostnames so sign-in works without changing `PUBLIC_BASE_URL` per deploy.

## Notes

- Uses Vite 8.3.1 (`vite` in `package.json`) and Varlock 1.21 (`@varlock/bitwarden-plugin` 2.x). Varlock’s Vite plugin uses `ssrInjectMode: "resolved-env"`. Production builds use `rolldownOptions` in `vite.config.ts` (`dropConsole`, default Oxc mangling, `devtools: {}` for Rolldown analysis metadata). Wrangler points `tsconfig` at [`tsconfig.wrangler.json`](./tsconfig.wrangler.json) (`alwaysStrict: false`) so esbuild nested-scope sloppy mode does not shadow mangled Svelte helpers ([esbuild#4545](https://github.com/evanw/esbuild/issues/4545), [#114](https://github.com/fringe4life/dollar-holler/issues/114)). Dev: `svelteDevtools()` before `sveltekit()`, then `DevTools()` from `@vitejs/devtools` (`0.7.6`). [`vite.config.ts`](./vite.config.ts) `stub-cloudflare-workers` rewrites Rolldown’s leftover `cloudflare:workers` protocol import to the adapter Node stub for SSR/prerender and `vite preview`; preview close plus Wrangler `build.command` restore the protocol so deploy can bundle. Helpers live in [`scripts/cloudflare-workers-specifier.ts`](./scripts/cloudflare-workers-specifier.ts). Tracked [`.cursor/mcp.json`](./.cursor/mcp.json): Fallow (`fallow-mcp`), Panda CSS (`panda-mcp`), ESLint MCP, and svelte-devtools at `http://localhost:5173/__svelte-devtools/mcp` (`x-svelte-devtools-token` from the token printed when `bun run dev` starts; rotates each restart). Tracked [`.kombai/mcp.json`](./.kombai/mcp.json) exposes the same Panda and Fallow stdio servers for Kombai (relative `node_modules/.bin` paths, Panda `--config ./panda.config.ts`); the rest of `.kombai/` stays gitignored. MCP stdio uses `node` + local bins, not `bun x`, because `bunfig.toml` preloads Varlock. Local D1 persist lives under `.wrangler/` (gitignored).
- Lint and format run through ESLint, Prettier, and Stylelint (`bun run check`, `bun run fix`). ESLint ignores generated paths (`styled-system/`, `.svelte-kit/`) and defers CSS to Stylelint. Cursor `afterFileEdit` runs `bun run fix`; Fallow gates `git` via `beforeShellExecution` and `stop` ([`.cursor/hooks/`](./.cursor/hooks/)).
- [Fallow](https://docs.fallow.tools) 3.30.0 resolves `styled-system/*` and `#features/*` via package.json `imports` / tsconfig paths (no `ignoreUnresolvedImports`). Type-aware analysis is `best-effort` in [`.fallowrc.json`](./.fallowrc.json). `@opentelemetry/api` is an ignored dependency (Sentry peer, imported indirectly). Feature `*.server.ts` files live in a `features-server` zone so remotes can import `require-user.server.ts` without crossing into `src/lib/server/**`. [`src/lib/theme/**`](./src/lib/theme/) sits in the `shared` zone. Health ignores [`error-message.ts`](./src/lib/utils/error-message.ts). Run `bun run fallow:prepare` (or any `fallow:*` script) so `styled-system/` exists before analysis; the folder is gitignored and is recreated by `panda build`. See [`docs/fallow-cursor-mcp.md`](./docs/fallow-cursor-mcp.md).
- Panda CSS 2.1 (`2.1.0`) generates `styled-system/` via `panda build`. [`vite.config.ts`](./vite.config.ts) loads `@pandacss/vite` with `transform: true` after `sveltekit()` (CSS inject + `.ts`/`.svelte` folds; no `postcss.config`). Dynamic pattern props (e.g. Spinner `center`/`circle` size maps) can still pull style runtime — [#109](https://github.com/fringe4life/dollar-holler/issues/109). [`panda.config.ts`](./panda.config.ts) imports `define*` modules from [`theme/`](./theme/). UI should prefer semantic tokens over raw palette names so `_dark` swaps automatically. `_dark` is defined in [`theme/conditions.ts`](./theme/conditions.ts) (class `.dark`, plus `prefers-color-scheme: dark` when `:root` is not `.light`). Shared keyframes live in [`theme/keyframes.ts`](./theme/keyframes.ts) (`defineKeyframes`, including `theme-circle-reveal`); one-off animations such as landing-nav solidify use `css.keyframes()` in the component. Root [`tsconfig.json`](./tsconfig.json) extends `$app/tsconfig` and declares `paths` for `#lib`, `#features`, and `styled-system` (also in `package.json` `imports`); `theme/**/*.ts` is included. [`vite.config.ts`](./vite.config.ts) sets `resolve.tsconfigPaths: true`. Typed pagination view-transition CSS lives in `PaginatedList.svelte`; `removeUnusedKeyframes` is off in `panda.config.ts` so theme keyframes named only from raw CSS are retained. Run `panda build` explicitly (via `bun run build`, `bun run panda:build`, or Fallow prepare) when `styled-system/` is missing. [`bunfig.toml`](./bunfig.toml) `minimumReleaseAgeExcludes` is empty (Kit 3 / Panda 2.1 stable).
- SvelteKit 3 uses `$app/env` (not `$app/environment`) for `building` / `dev` in server code. Typed routes use filesystem route IDs with `resolve()` (for example `/(dashboard)/invoices/[id=uuid]`). Matchers live in [`src/params.ts`](./src/params.ts) (`defineParams`). `kit.alias` is deprecated in favor of tsconfig paths / package.json `#` imports. Static assets use `$app/paths` `asset("images/...")` without a leading slash. Shallow list navigations use `goto(url, { shallow: true })` (not deprecated `pushState`).
- The project uses Svelte 5's `@attach` directive for modern component patterns and the Spring class for smooth animations.
- Better Auth is configured in `auth.server.ts` as isolate-cached `getAuth()` so `drizzleAdapter` does not read `db._` at import; UUIDv7 (uuidv7 package) for user ID generation; session cookie cache enabled. After upgrading to 1.7.4+, apply `0004_purple_fat_cobra` (drop `account_issuer_accountId_uidx`, then drop `issuer`) and `0005_left_squadron_sinister` (non-unique `(provider_id, account_id)` lookup index) under `src/lib/server/db/d1/` if those have not already been applied. Account identity is `(provider_id, account_id)`, matching 1.6.
- Invoice `notes` and `terms` accept Markdown. Editor overlay uses Prism `tokenize` + a local serializer (escaped text + `span.token`); create/update remotes derive sanitized HTML via [`invoice-notes-terms-html.server.ts`](./src/lib/server/utils/invoice-notes-terms-html.server.ts) only after auth / ownership checks. Overlay markup is paint-only — never stored as `notes_html` / `terms_html`.
- SvelteKit configuration lives in the `sveltekit()` Vite plugin in `vite.config.ts` (`@sveltejs/adapter-cloudflare` 8, preprocess, Svelte 5 async compiler option, `experimental.remoteFunctions`, tracing/server instrumentation for Sentry). Wrangler `platformProxy.persist` keeps local D1 across `bun run dev`. Invoice detail [`+layout@.svelte`](<./src/routes/(dashboard)/invoices/[id=uuid]/+layout@.svelte>) uses `paddingBlockEnd` so the visually offset surface stays in the document scroll flow (no nested scrollbar).
- Form validation uses Valibot (`valibot` 1.5) for remote `form()` schemas in `src/lib/features/*/schemas.ts`; Drizzle Kit uses `drizzle-orm/valibot` for insert/select/update schemas. Invoice create/edit is a single `InvoiceEditor` with server-side persist in `persist-invoice.server.ts` (no client-side edit snapshots).

## License

MIT
