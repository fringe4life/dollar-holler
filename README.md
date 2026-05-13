# Dollar Holler

<div align="center">

[![SvelteKit](https://img.shields.io/badge/SvelteKit-2.59.1-orange?logo=svelte&logoColor=white)](https://kit.svelte.dev/) [![Svelte](https://img.shields.io/badge/Svelte-5.55.5-red?logo=svelte&logoColor=white)](https://svelte.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-1.0.0--rc.1-green?logo=postgresql&logoColor=white)](https://orm.drizzle.team/) [![Better Auth](https://img.shields.io/badge/Better%20Auth-1.6.9-purple?logo=auth0&logoColor=white)](https://www.better-auth.com/) [![Neon](https://img.shields.io/badge/Neon%20serverless-1.1.0-00e5ff?logo=neon&logoColor=white)](https://neon.tech/) [![Elysia](https://img.shields.io/badge/Elysia-1.4.28-pink?logo=bun&logoColor=white)](https://elysiajs.com/) [![Panda CSS](https://img.shields.io/badge/Panda%20CSS-1.11.1-16A34A?logo=css3&logoColor=white)](https://panda-css.com/) [![Sentry](https://img.shields.io/badge/Sentry-10.52.0-362D59?logo=sentry&logoColor=white)](https://sentry.io/)

</div>

A modern invoice management application built with SvelteKit 5, featuring Better Auth authentication, Drizzle ORM with Neon database, Sentry error monitoring, and Bun UUIDv7 for resilient ID generation.

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
   - **Bun:** [`bunfig.toml`](./bunfig.toml) sets `env = false` and `preload = ["varlock/auto-load"]` so Bun does not load `.env` on its own before Varlock (see [Varlock + Bun](https://varlock.dev/integrations/bun/)).
   - **Vite / SvelteKit:** [`vite.config.ts`](./vite.config.ts) uses `@varlock/vite-integration` with `ssrInjectMode: "resolved-env"` ([Varlock + Vite](https://varlock.dev/integrations/vite/)).
   - **Bitwarden:** Install the app deps (already in `package.json`), then in Bitwarden Secrets Manager create a **machine account**, copy its **access token** once, and grant it read access to the secrets you need. Put the token in a **gitignored** file such as `.env.local` as `BITWARDEN_ACCESS_TOKEN=...`. In `.env.schema`, replace the placeholder UUIDs in `bitwarden("...")` with your real secret IDs ([Bitwarden plugin](https://varlock.dev/plugins/bitwarden/)).
   - **Without Bitwarden (e.g. quick local setup):** Set `DATABASE_URL`, `BETTER_AUTH_SECRET`, `PUBLIC_BASE_URL`, and `SENTRY_AUTH_TOKEN` (Sentry auth token used by the Vite plugin for releases when `mode !== "development"`) in `.env` or `.env.local` with literal values instead of `bitwarden(...)` where applicable. Host and CI variables still override resolved values when set.
   - **Types:** After changing `.env.schema`, run `bun run env:typegen` to refresh [`src/env-varlock.d.ts`](./src/env-varlock.d.ts).

   The app resolves configuration from Varlock (`varlock/env`) for Drizzle Kit ([`drizzle.config.ts`](./drizzle.config.ts)), auth ([`src/lib/auth.server.ts`](./src/lib/auth.server.ts)), and the Eden client ([`src/lib/api.ts`](./src/lib/api.ts)). The database pool ([`src/lib/server/db/index.ts`](./src/lib/server/db/index.ts)) reads `DATABASE_URL` from SvelteKit `$env/static/private` (populated by the Varlock Vite integration in dev/build). SvelteKit `$env/static/*` remains available where used.

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
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run check` - Run Ultracite (Biome) checks
- `bun run check:watch` - `svelte-kit sync` then `svelte-check --watch`
- `bun run env:typegen` - Regenerate types from `.env.schema` (Varlock)
- `bun run db:generate` - Generate Drizzle migrations
- `bun run db:migrate` - Run database migrations
- `bun run db:seed` - Seed database with sample data
- `bun run db:studio` - Open Drizzle Studio
- `bun run db:push` - Push schema directly to the database
- `bun run ultracite:upgrade` - Re-run Ultracite init/upgrade for this stack
- `bun run fix` - Run Ultracite fix (`ultracite fix`)
- `bun run fallow` - Run [Fallow](https://github.com/benefacto/fallow) (project graph and analysis)
- `bun run fallow:dead-code` - Fallow dead-code pass
- `bun run fallow:boundaries` - List configured boundaries
- `bun run fallow:boundary-violations` - Dead-code with boundary violations
- `bun run fallow:dupes` - Fallow duplicate detection
- `bun run prepare` (auto) - `panda codegen` and `svelte-kit sync` after install

## Tech Stack

- **Framework:** SvelteKit 5 with Svelte 5 runes (experimental server instrumentation and tracing enabled in [`svelte.config.js`](./svelte.config.js))
- **Observability:** [Sentry](https://sentry.io/) for SvelteKit ([`src/hooks.server.ts`](./src/hooks.server.ts), [`src/hooks.client.ts`](./src/hooks.client.ts), [`src/instrumentation.server.ts`](./src/instrumentation.server.ts), Vite plugin in [`vite.config.ts`](./vite.config.ts) when not in `development`)
- **API layer:** ElysiaJS in [`src/lib/server/app.ts`](./src/lib/server/app.ts) (OpenAPI/Scalar in dev via [`openapi-plugin.ts`](./src/lib/server/plugins/openapi-plugin.ts), auth macros in [`auth-plugin.ts`](./src/lib/server/plugins/auth-plugin.ts), list-query helpers in [`list-query-plugin.ts`](./src/lib/server/plugins/list-query-plugin.ts), domain routes), mounted at `/api` via [`src/routes/api/[...slugs]/+server.ts`](./src/routes/api/[...slugs]/+server.ts), Eden Treaty client [`apiClient`](./src/lib/api.ts) (`@elysiajs/eden/treaty2`)
- **Database:** PostgreSQL with Neon serverless
- **ORM:** Drizzle ORM 1.0 (rc) with Neon serverless driver (WebSocket `Pool`)
- **Authentication:** Better Auth with email/password ([`src/lib/auth.server.ts`](./src/lib/auth.server.ts), Drizzle adapter, bearer + OpenAPI plugins)
- **ID generation:** `Bun.randomUUIDv7()` via [`create-uuidv7.server.ts`](./src/lib/features/pagination/utils/create-uuidv7.server.ts) (cursor-friendly IDs)
- **Deployment:** Vercel adapter
- **Package manager:** Bun
- **Validation:** ArkType for runtime-safe form validation
- **Bundler:** Vite 8 for dev and production builds
- **UI components:** [Ark UI for Svelte](https://ark-ui.com/) (`@ark-ui/svelte`)
- **Styling:** [Panda CSS](https://panda-css.com/) with generated `styled-system` (see `panda.config.ts`, PostCSS, `prepare` script)
- **Lint/format:** [Ultracite](https://ultracite.dev/) on top of [Biome](https://biomejs.dev/) (`biome.jsonc`)

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
│   │   │   ├── index.ts     # Database connection (Neon serverless WebSocket pool)
│   │   │   ├── schema.ts    # Drizzle tables and enums
│   │   │   ├── types.ts     # Enum-derived types (e.g. client/invoice status)
│   │   │   ├── relations.ts # Drizzle relations v2 (`defineRelations`)
│   │   │   └── seed.ts      # Database seeding
│   │   ├── app.ts           # Elysia app: OpenAPI plugin, auth mount, API routes, error mapping
│   │   ├── plugins/         # OpenAPI (dev), auth, list-query
│   │   ├── schemas.ts       # Shared API response shapes
│   │   ├── utils/           # better-auth-openapi, api-error-body, errors
│   │   └── routes/          # API modules (clients, invoices, settings)
│   ├── client/            # Client-only: @attach helpers, shared runes (ItemPanel, etc.)
│   ├── features/          # Domain features: components, stores, schemas, list helpers
│   │   ├── auth/
│   │   ├── clients/       # includes server queries (list, options, verify)
│   │   ├── invoices/      # includes server queries (list, verify)
│   │   ├── landing-page/  # Marketing sections, nav, copy constants
│   │   ├── line-items/
│   │   ├── pagination/    # PaginatedList, search, blank states, UUIDv7 `createId` (server module)
│   │   └── settings/
│   ├── components/        # Shared UI (navbar/, icons under components/icons/, ui/)
│   ├── stores/            # Shared list-store bases, dashboard context
│   ├── styles.ts          # Shared class names / style recipes
│   └── utils/
├── routes/
│   ├── (auth)/            # Login, signup, password reset, logout
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
- `invoices` - Invoice records (`invoice_status`: draft, sent, paid; optional discount)
- `line_items` - Invoice line items
- `settings` - User settings

Primary keys use PostgreSQL `uuid` columns; IDs are Bun UUIDv7 strings from `createId` (including Better Auth `generateId` in [`src/lib/auth.server.ts`](./src/lib/auth.server.ts)). Foreign keys use cascade deletes where appropriate.

The application uses Drizzle's relations v2 (`defineRelations`) to simplify nested queries (e.g., `db.query.invoices.findMany({ with: { client: true, lineItems: true } })`) and avoid manual joins in API routes.

## Features

- **Error monitoring:** Sentry on server and client with Kit instrumentation
- **Modern Authentication:** Better Auth with email/password support
- **Type-Safe Database:** Drizzle ORM with full TypeScript support
- **Serverless Ready:** Neon serverless driver (WebSocket pool) for Vercel deployment
- **Resilient IDs:** Bun UUIDv7 for cursor-based navigation and performance
- **Recent Data:** Seed script generates realistic data from the last 6 months
- **Multi-User Support:** Data is distributed randomly among users
- **Auth Flows:** Reset password supported; token is read from URL and validated
- **Modern UI:** Ark UI components with Panda CSS
- **Svelte 5 Runes:** Uses @attach directives and reactive patterns
- **Responsive Design:** Mobile-first with swipe gestures

## Deployment

The application is configured for Vercel deployment with the Vercel adapter. [`vercel.json`](./vercel.json) sets `buildCommand` to `svelte-kit sync && panda codegen && panda cssgen && bun --bun run build` (aligns with Panda static CSS output on the platform).

- **Platform env vars:** Set `DATABASE_URL`, `BETTER_AUTH_SECRET`, `PUBLIC_BASE_URL`, and `SENTRY_AUTH_TOKEN` in the Vercel project (and any other keys your schema requires). You can rely on Varlock for validation while storing values only in Vercel.
- **Bitwarden at build time:** Add `BITWARDEN_ACCESS_TOKEN` to Vercel so the build can resolve `bitwarden(...)` entries in `.env.schema` ([Varlock Vite SSR options](https://varlock.dev/integrations/vite/)).

## Notes

- Uses Vite 8 (`vite` in `package.json`). Varlock’s Vite plugin uses `ssrInjectMode: "resolved-env"`. Production builds use `rolldownOptions` in `vite.config.ts` (for example `dropConsole`). If issues arise with third-party plugins, see Vite's documentation for compatibility.
- Lint and format run through Ultracite (`bun run check`, `bun run fix`) with Biome rules extended from `ultracite/biome` for core and Svelte.
- Panda CSS generates `styled-system/`; `svelte.config.js` aliases `styled-system` and extends TypeScript `include` for `drizzle.config.ts` and `styled-system/*`. After dependency install, `prepare` runs codegen for Panda.
- The project uses Svelte 5's `@attach` directive for modern component patterns and the Spring class for smooth animations.
- Better Auth is configured in `auth.server.ts` to use Bun UUIDv7 for user ID generation and includes session caching for performance.
- App configuration lives in `svelte.config.js` (Vercel adapter, preprocess, Svelte 5 async compiler option, experimental server instrumentation for Sentry).

## License

MIT
