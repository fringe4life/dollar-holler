# Dollar Holler

<div align="center">

[![SvelteKit](https://img.shields.io/badge/SvelteKit-3.0.0--next.7-orange?logo=svelte&logoColor=white)](https://kit.svelte.dev/) [![Svelte](https://img.shields.io/badge/Svelte-5.56.4-red?logo=svelte&logoColor=white)](https://svelte.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-1.0.0--rc.4-green?logo=postgresql&logoColor=white)](https://orm.drizzle.team/) [![Better Auth](https://img.shields.io/badge/Better%20Auth-1.7.0--rc.1-purple?logo=auth0&logoColor=white)](https://www.better-auth.com/) [![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00e5ff?logo=neon&logoColor=white)](https://neon.tech/) [![pg](https://img.shields.io/badge/pg-8.22.0-336791?logo=postgresql&logoColor=white)](https://node-postgres.com/) [![Elysia](https://img.shields.io/badge/Elysia-1.4.29-pink?logo=bun&logoColor=white)](https://elysiajs.com/) [![Panda CSS](https://img.shields.io/badge/Panda%20CSS-2.0.0--beta.8-16A34A?logo=css3&logoColor=white)](https://panda-css.com/) [![Sentry](https://img.shields.io/badge/Sentry-10.63.0-362D59?logo=sentry&logoColor=white)](https://sentry.io/)

</div>

A modern invoice management application built with SvelteKit 3 (pre-release) and Svelte 5, featuring Better Auth authentication, Drizzle ORM on Neon PostgreSQL (`pg` + Vercel Fluid pool lifecycle), Sentry error monitoring, and UUIDv7 for resilient cursor-friendly IDs.

## Prerequisites

- [Bun](https://bun.sh/) (required)
- [Neon](https://neon.tech/) account for PostgreSQL database
- [Vercel](https://vercel.com/) account for deployment (optional)

## Getting Started

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd dollar-holler
   bun install
   ```

2. **Set up environment variables ([Varlock](https://varlock.dev/)):** The committed [`.env.schema`](./.env.schema) is the source of truth for variable names, validation, and (optional) [Bitwarden Secrets Manager](https://bitwarden.com/products/secrets-manager/) lookups.
   - **Bun:** [`bunfig.toml`](./bunfig.toml) sets `env = false` and `preload = ["varlock/auto-load"]` so Bun does not load `.env` on its own before Varlock (see [Varlock + Bun](https://varlock.dev/integrations/bun/)). A 3-day `minimumReleaseAge` is enabled; SvelteKit pre-releases are listed in `minimumReleaseAgeExcludes` when upgrading early.
   - **Vite / SvelteKit:** [`vite.config.ts`](./vite.config.ts) uses `@varlock/vite-integration` with `ssrInjectMode: "resolved-env"` ([Varlock + Vite](https://varlock.dev/integrations/vite/)).
   - **Bitwarden:** Install the app deps (already in `package.json`), then in Bitwarden Secrets Manager create a **machine account**, copy its **access token** once, and grant it read access to the secrets you need. Put the token in a **gitignored** file such as `.env.local` as `BITWARDEN_ACCESS_TOKEN=...`. In `.env.schema`, replace the placeholder UUIDs in `bitwarden("...")` with your real secret IDs ([Bitwarden plugin](https://varlock.dev/plugins/bitwarden/)).
   - **Without Bitwarden (e.g. quick local setup):** Set `DATABASE_URL`, `BETTER_AUTH_SECRET`, `PUBLIC_BASE_URL`, and `SENTRY_AUTH_TOKEN` (Sentry auth token used by the Vite plugin for releases when `mode !== "development"`) in `.env` or `.env.local` with literal values instead of `bitwarden(...)` where applicable. Host and CI variables still override resolved values when set.
   - **Types:** After changing `.env.schema`, run `bun run env:typegen` to refresh [`src/env-varlock.d.ts`](./src/env-varlock.d.ts).

   The app resolves configuration from Varlock (`import { ENV } from "varlock/env"`) for Drizzle Kit ([`drizzle.config.ts`](./drizzle.config.ts)), auth ([`src/lib/auth.server.ts`](./src/lib/auth.server.ts)), the Eden client ([`src/lib/api.ts`](./src/lib/api.ts)), and the database pool ([`src/lib/server/db/index.ts`](./src/lib/server/db/index.ts)).

3. **Set up the database:** The `bun run db:*` scripts invoke Drizzle Kit (`bun x drizzle-kit`). Ensure `DATABASE_URL` is available in the environment (Varlock via Bun preload, or `.env` / `.env.local`). `drizzle.config.ts` points at `./src/lib/server/db/schema.ts` and writes migrations under `./src/lib/server/db/migrations`.

   ```bash
   # Generate migrations
   bun run db:generate

   # Run migrations
   bun run db:migrate

   # Seed the database with sample data
   bun run db:seed
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
- `bun run panda:build` - Run `svelte-kit sync` and `panda build` only
- `bun run preview` - Preview production build
- `bun run lint` - Run ESLint
- `bun run lint:fix` - Run ESLint with auto-fix
- `bun run format` - Format with Prettier
- `bun run format:check` - Check Prettier formatting
- `bun run stylelint` - Lint CSS under `src/**/*.css`
- `bun run check` - ESLint, Prettier check, Stylelint, then `svelte-check`
- `bun run check:watch` - `svelte-kit sync` then `svelte-check --watch`
- `bun run fix` - `lint:fix`, `format`, and Stylelint with `--fix`
- `bun run env:typegen` - Regenerate types from `.env.schema` (Varlock)
- `bun run db:generate` - Generate Drizzle migrations (Varlock `run`)
- `bun run db:migrate` - Run database migrations (Varlock `run`)
- `bun run db:seed` - Seed database with sample data (Varlock `run`)
- `bun run db:studio` - Open Drizzle Studio (Varlock `run`)
- `bun run db:push` - Push schema directly to the database (Varlock `run`)
- `bun run fallow:prepare` - `svelte-kit sync` and `panda build` (run before Fallow if you invoke the CLI directly; other `fallow:*` scripts call this automatically)
- `bun run fallow` - Full Fallow analysis (after prepare)
- `bun run fallow:dead-code` - Dead code analysis (after prepare)
- `bun run fallow:boundaries` - List configured boundaries
- `bun run fallow:boundary-violations` - Dead-code with boundary violations
- `bun run fallow:dupes` - Fallow duplicate detection
- `bun run prepare` (auto) - `svelte-kit sync` and `panda build` after install

## Tech Stack

- **Framework:** SvelteKit 3 (`3.0.0-next.7`) with `@sveltejs/adapter-vercel` 7 and Svelte 5 runes (experimental `remoteFunctions`, async compiler, server instrumentation and tracing in [`vite.config.ts`](./vite.config.ts))
- **Observability:** [Sentry](https://sentry.io/) on the server ([`src/instrumentation.server.ts`](./src/instrumentation.server.ts), [`src/hooks.server.ts`](./src/hooks.server.ts)); client SDK in [`src/hooks.client.ts`](./src/hooks.client.ts) is temporarily disabled pending SvelteKit 3 support in Sentry v11; Vite release plugin in [`vite.config.ts`](./vite.config.ts) is commented out
- **API layer:** ElysiaJS in [`src/lib/server/app.ts`](./src/lib/server/app.ts) (OpenAPI/Scalar in dev via [`openapi-plugin.ts`](./src/lib/server/plugins/openapi-plugin.ts), auth macros in [`auth-plugin.ts`](./src/lib/server/plugins/auth-plugin.ts), list-query helpers in [`list-query-plugin.ts`](./src/lib/server/plugins/list-query-plugin.ts), domain routes), mounted at `/api` via [`src/routes/api/[...slugs]/+server.ts`](./src/routes/api/[...slugs]/+server.ts), Eden Treaty client [`apiClient`](./src/lib/api.ts) (`@elysiajs/eden/treaty2`); auth forms use Kit remote `form`s in [`auth.remote.ts`](./src/lib/features/auth/auth.remote.ts) (see [`docs/remote-functions-migration.md`](./docs/remote-functions-migration.md))
- **Database:** Neon PostgreSQL
- **ORM:** Drizzle ORM 1.0 (rc.4) with `node-postgres` (`pg` `Pool`); [`attachDatabasePool`](https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package#attachdatabasepool) from `@vercel/functions` for Fluid Compute idle cleanup ([`src/lib/server/db/index.ts`](./src/lib/server/db/index.ts))
- **Authentication:** Better Auth 1.7 with email/password ([`src/lib/auth.server.ts`](./src/lib/auth.server.ts), `allowedHosts` for production and Vercel preview URLs, `@better-auth/drizzle-adapter` relations-v2, bearer + OpenAPI plugins); login/signup/forgot/reset/change-password via remote forms
- **ID generation:** UUIDv7 via the [`uuidv7`](https://github.com/LiosK/uuidv7) package, wrapped in [`create-id.ts`](./src/lib/server/utils/create-id.ts) (cursor-friendly IDs, used by Drizzle defaults and Better Auth `generateId`)
- **Rich text:** Notes and terms accept Markdown; rendered HTML is sanitized server-side with [`marked`](https://marked.js.org/) and [`sanitize-html`](https://github.com/apostrophecms/sanitize-html) ([`markdown.server.ts`](./src/lib/utils/markdown.server.ts)) and persisted alongside the source in [`invoice_notes_html` / `invoice_terms_html`](./src/lib/server/db/schema.ts)
- **Deployment:** Vercel adapter (`@sveltejs/adapter-vercel` 7)
- **Package manager:** Bun
- **Validation:** ArkType for runtime-safe form validation
- **Bundler:** Vite 8 for dev and production builds
- **UI components:** [Ark UI for Svelte](https://ark-ui.com/) (`@ark-ui/svelte`)
- **Styling:** [Panda CSS](https://panda-css.com/) 2.0 (beta) with generated `styled-system` via `panda build` (see `panda.config.ts`, PostCSS, `prepare` script); [Source Sans 3 Variable](https://fontsource.org/fonts/source-sans-3) via `@fontsource-variable/source-sans-3`
- **Lint/format:** ESLint 10 with TypeScript ESLint and eslint-plugin-svelte ([`eslint.config.mjs`](./eslint.config.mjs)), Prettier 3 with prettier-plugin-svelte ([`prettier.config.mjs`](./prettier.config.mjs)), Stylelint 17 for CSS ([`stylelint.config.mjs`](./stylelint.config.mjs))

## Project Structure

```
src/
├── hooks.server.ts          # Sentry handle, Better Auth session, route guards, font preload
├── hooks.client.ts          # Sentry client init and handleError
├── instrumentation.server.ts # Sentry server init (Kit experimental instrumentation)
├── lib/
│   ├── auth.server.ts       # Centralized Better Auth configuration (Drizzle adapter, UUIDv7 IDs)
│   ├── api.ts               # Eden Treaty client (`apiClient`)
│   ├── server/
│   │   ├── db/
│   │   │   ├── index.ts     # Database connection (pg Pool + Vercel attachDatabasePool)
│   │   │   ├── schema.ts    # Drizzle tables and enums
│   │   │   ├── types.ts     # Enum-derived types (e.g. client/invoice status)
│   │   │   ├── relations.ts # Drizzle relations v2 (`defineRelations`)
│   │   │   └── seed.ts      # Database seeding
│   │   ├── app.ts           # Elysia app: OpenAPI plugin, auth mount, API routes, error mapping
│   │   ├── plugins/         # OpenAPI (dev), auth, list-query
│   │   ├── schemas.ts       # Shared API response shapes
│   │   ├── utils/           # create-id (UUIDv7), invoice-notes-terms-html, invoice-status-transitions, better-auth-openapi, api-error-body, errors
│   │   └── routes/          # API modules (clients, invoices, settings)
│   ├── client/            # Client-only: @attach helpers (dialogController, swipe), shared runes (ItemPanel, etc.)
│   ├── features/          # Domain features: components, stores, schemas, list helpers, remotes
│   │   ├── auth/          # auth.remote.ts (Kit remote forms), ArkType schemas
│   │   ├── clients/       # includes server queries (list, options, verify)
│   │   ├── invoices/      # includes server queries (list, verify)
│   │   ├── landing-page/  # Marketing sections, nav, copy constants
│   │   ├── line-items/
│   │   ├── pagination/    # PaginatedList, search, blank states, cursor list-query helpers
│   │   └── settings/
│   ├── components/        # Shared UI (Form remote binding, Modal, navbar/, icons, ui/)
│   ├── stores/            # Shared list-store bases, dashboard context
│   ├── styles.ts          # Shared class names / style recipes
│   └── utils/
├── routes/
│   ├── (auth)/            # Login, signup, forgot/reset password, logout (remote forms; no +page.server.ts)
│   ├── (dashboard)/
│   │   ├── (shell)/       # App shell: clients, invoice list, settings, thanks
│   │   └── invoices/      # Invoice detail, line items
│   ├── api/               # Elysia catch-all API handler
│   ├── +layout.svelte
│   └── +page.svelte       # Landing page
└── app.html
```

## Database Schema

The application uses the following main tables:

- `user` - Better Auth user accounts
- `session` - User sessions
- `account` - OAuth accounts
- `verification` - Email verification tokens
- `clients` - Client information (`client_status`: active, archive)
- `invoices` - Invoice records (`invoice_status`: draft, sent, paid; optional discount; markdown `notes` / `terms` plus precomputed sanitized `notes_html` / `terms_html`)
- `line_items` - Invoice line items
- `settings` - User settings

Primary keys use PostgreSQL `uuid` columns; IDs are UUIDv7 strings from [`createId`](./src/lib/server/utils/create-id.ts) (uuidv7 package), including Better Auth `generateId` in [`src/lib/auth.server.ts`](./src/lib/auth.server.ts). Foreign keys use cascade deletes where appropriate.

The application uses Drizzle's relations v2 (`defineRelations`) to simplify nested queries (e.g., `db.query.invoices.findMany({ with: { client: true, lineItems: true } })`) and avoid manual joins in API routes.

## Features

- **Error monitoring:** Sentry on server with Kit instrumentation (client SDK disabled until Sentry v11)
- **Modern Authentication:** Better Auth with email/password support
- **Remote forms:** Auth (and settings password change) via SvelteKit remote `form`s; dashboard lists still Eden/stores (migration plan in docs)
- **Type-Safe Database:** Drizzle ORM with full TypeScript support
- **Serverless Ready:** `pg` pool + `@vercel/functions` `attachDatabasePool` for Vercel Fluid Compute
- **Resilient IDs:** UUIDv7 (uuidv7 package) for cursor-based navigation and performance
- **Safe rich text:** Markdown notes/terms sanitized server-side and stored as both source and HTML
- **Recent Data:** Seed script generates realistic data from the last 6 months
- **Multi-User Support:** Data is distributed randomly among users
- **Auth Flows:** Forgot and reset password supported; reset token read from URL and validated
- **Modern UI:** Ark UI components with Panda CSS
- **Svelte 5 Runes:** Uses @attach directives and reactive patterns
- **Responsive Design:** Mobile-first with swipe gestures

## Deployment

The application is configured for Vercel deployment with the Vercel adapter. [`vercel.json`](./vercel.json) sets `buildCommand` to `svelte-kit sync && panda build && bun --bun run build` (aligns with Panda static CSS output on the platform).

- **Platform env vars (Preview / Production):** With `ssrInjectMode: "resolved-env"`, secrets are resolved at build time and baked into the server bundle. Set `BITWARDEN_ACCESS_TOKEN` so the build can resolve `bitwarden(...)` entries in [`.env.schema`](./.env.schema), and set `PUBLIC_BASE_URL` to your deployment URL (not the localhost default). Add `SENTRY_AUTH_TOKEN` if you use the Sentry Vite plugin for release uploads ([Varlock + Vite](https://varlock.dev/integrations/vite/)). You do not need `DATABASE_URL` or `BETTER_AUTH_SECRET` on Vercel when Bitwarden resolution succeeds at build. Better Auth `allowedHosts` in [`auth.server.ts`](./src/lib/auth.server.ts) covers Vercel preview hostnames so sign-in works on preview URLs without changing `PUBLIC_BASE_URL` per deploy.

## Notes

- Uses Vite 8 (`vite` in `package.json`) and Varlock 1.10 (`@varlock/bitwarden-plugin` 2.x). Varlock’s Vite plugin uses `ssrInjectMode: "resolved-env"`. Production builds use `rolldownOptions` in `vite.config.ts` (for example `dropConsole`). If issues arise with third-party plugins, see Vite's documentation for compatibility.
- Lint and format run through ESLint, Prettier, and Stylelint (`bun run check`, `bun run fix`). ESLint ignores generated paths (`styled-system/`, `.svelte-kit/`) and defers CSS to Stylelint.
- [Fallow](https://docs.fallow.tools) resolves `styled-system/*` imports from the generated Panda output and `$lib` path aliases (including `.svelte` → `.svelte.ts` modules). Custom `kit.alias` paths such as `$features/*` are ignored in [`.fallowrc.json`](./.fallowrc.json) because the SvelteKit plugin does not resolve them the same way Vite does. Run `bun run fallow:prepare` (or any `fallow:*` script) so `styled-system/` exists before analysis; the folder is gitignored and is recreated by `panda build`.
- Panda CSS 2.0 generates `styled-system/` via `panda build`; path aliases (`$lib`, `$features`, `styled-system`) live in `kit.alias` inside [`vite.config.ts`](./vite.config.ts). Root [`tsconfig.json`](./tsconfig.json) extends `.svelte-kit/tsconfig.json` only—do not duplicate `paths` there. The Kit TypeScript hook adds `panda.config.ts` and `drizzle.config.ts` to the generated include list and omits generated `styled-system` sources from typechecking. After dependency install, `prepare` runs `panda build`.
- SvelteKit 3 uses `$app/env` (not `$app/environment`) for `building` / `dev` in server code. Typed routes use filesystem route IDs with `resolve()` (for example `/(dashboard)/invoices/[id]`).
- The project uses Svelte 5's `@attach` directive for modern component patterns and the Spring class for smooth animations.
- Better Auth is configured in `auth.server.ts` to use UUIDv7 (uuidv7 package) for user ID generation and includes session caching for performance.
- Invoice `notes` and `terms` accept Markdown; create/update endpoints derive sanitized HTML via [`invoice-notes-terms-html.server.ts`](./src/lib/server/utils/invoice-notes-terms-html.server.ts) only after auth / ownership checks (see [`auth-plugin.ts`](./src/lib/server/plugins/auth-plugin.ts)).
- SvelteKit configuration lives in the `sveltekit()` Vite plugin in `vite.config.ts` (`@sveltejs/adapter-vercel` 7, preprocess, Svelte 5 async compiler option, `experimental.remoteFunctions`, tracing/server instrumentation for Sentry).

## License

MIT
