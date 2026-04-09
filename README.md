# Dollar Holler

<div align="center">

[![SvelteKit](https://img.shields.io/badge/SvelteKit-2.57.0-orange?logo=svelte&logoColor=white)](https://kit.svelte.dev/) [![Svelte](https://img.shields.io/badge/Svelte-5.55.2-red?logo=svelte&logoColor=white)](https://svelte.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-1.0.0%20beta.20-green?logo=postgresql&logoColor=white)](https://orm.drizzle.team/) [![Better Auth](https://img.shields.io/badge/Better%20Auth-1.6.0-purple?logo=auth0&logoColor=white)](https://www.better-auth.com/) [![Neon](https://img.shields.io/badge/Neon%20serverless-1.0.2-00e5ff?logo=neon&logoColor=white)](https://neon.tech/) [![Elysia](https://img.shields.io/badge/Elysia-1.4.28-pink?logo=bun&logoColor=white)](https://elysiajs.com/) [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.2.2-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

A modern invoice management application built with SvelteKit 5, featuring Better Auth authentication, Drizzle ORM with Neon database, and Bun UUIDv7 for resilient ID generation.

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

2. **Set up environment variables:** Create a `.env` file in the root directory for local development. SvelteKit loads these for `$env/static/private` and `$env/static/public`. The database client uses `DATABASE_URL` from `$env/static/private` (`src/lib/db/index.ts`).

   ```env
   DATABASE_URL="postgresql://username:password@hostname:port/database"
   PUBLIC_BASE_URL="http://localhost:5173"
   BETTER_AUTH_SECRET="your-strong-secret"
   ```

   For production, use `.env.production` (and/or your Vercel project settings) and set `PUBLIC_BASE_URL` to your deployed origin (for example `https://dollar-holler.vercel.app`).

3. **Set up the database:** Drizzle Kit reads `DATABASE_URL` from the environment (`drizzle.config.ts` points at `./src/lib/db/schema.ts` and writes migrations under `./drizzle`).

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
- `bun run check` - Run Ultracite checks
- `bun run check:watch` - Run Svelte check in watch mode
- `bun run db:generate` - Generate Drizzle migrations
- `bun run db:migrate` - Run database migrations
- `bun run db:seed` - Seed database with sample data
- `bun run db:clear` - Clear application data from the database
- `bun run db:studio` - Open Drizzle Studio
- `bun run db:push` - Push schema directly to the database
- `bun run format` - Format source with Prettier
- `bun run lint` - Run Prettier check and ESLint
- `bun run lint:fix` - Auto-fix lint and formatting issues
- `bun run ultracite:check` - Run Ultracite checks directly
- `bun run ultracite:upgrade` - Re-run Ultracite init/upgrade for this stack
- `bun run fix` - Run Ultracite fix (`ultracite fix`)

## Tech Stack

- **Framework:** SvelteKit 5 with Svelte 5 runes
- **API layer:** ElysiaJS (`src/lib/server` route modules), mounted at `/api` via `src/routes/api/[...slugs]/+server.ts`, Eden Treaty client in `src/lib/client.ts`
- **Database:** PostgreSQL with Neon serverless
- **ORM:** Drizzle ORM (beta) with Neon serverless driver (WebSocket `Pool`)
- **Authentication:** Better Auth with email/password (`src/lib/auth.ts`, Drizzle adapter)
- **ID generation:** `Bun.randomUUIDv7()` via `src/lib/features/pagination/utils/create-uuidv7.ts` (cursor-friendly IDs)
- **Deployment:** Vercel adapter
- **Package manager:** Bun
- **Validation:** ArkType for runtime-safe form validation
- **Bundler:** Vite 8 for dev and production builds
- **UI components:** Bits UI with Tailwind CSS
- **Styling:** Tailwind CSS 4 with Tailwind Variants
- **Lint/format:** Ultracite (ESLint, Prettier, Stylelint)

## Project Structure

```
src/
├── lib/
│   ├── auth.ts              # Better Auth configuration (Drizzle adapter, UUIDv7 user IDs)
│   ├── auth-client.ts       # Client-side auth helpers
│   ├── client.ts            # Eden Treaty client for the Elysia API
│   ├── db/
│   │   ├── index.ts         # Database connection (Neon serverless WebSocket pool)
│   │   ├── schema.ts        # Drizzle schema and relations
│   │   ├── seed.ts          # Database seeding
│   │   ├── clear-app-data.ts
│   │   └── migrate.ts
│   ├── server/
│   │   ├── auth-plugin.ts   # Better Auth integration for Elysia
│   │   ├── api-response-schemas.ts
│   │   └── routes/        # API modules (clients, invoices, settings)
│   ├── features/          # Domain features: components, stores, schemas, list helpers
│   │   ├── auth/
│   │   ├── clients/
│   │   ├── invoices/
│   │   ├── line-items/
│   │   ├── pagination/    # Cursor pagination, list-query utilities, UUIDv7 helper
│   │   └── settings/
│   ├── components/        # Shared UI (icons under components/icons/)
│   ├── attachments/       # Svelte 5 @attach helpers (e.g. swipe, clickOutside)
│   ├── runes/             # Shared rune modules (ItemPanel, etc.)
│   ├── stores/            # Shared list-store bases, dashboard context
│   ├── utils/
│   └── validators.ts
├── routes/
│   ├── (auth)/            # Login, signup, password reset, logout
│   ├── (dashboard)/
│   │   ├── (shell)/       # App shell: clients, invoice list, settings
│   │   └── invoices/      # Invoice detail, line items, thanks
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
- `clients` - Client information
- `invoices` - Invoice records
- `line_items` - Invoice line items
- `settings` - User settings

Primary keys use Bun UUIDv7 strings (`createId`) and include proper foreign key relationships with cascade deletes.

The application uses Drizzle's relations v2 (`defineRelations`) to simplify nested queries (e.g., `db.query.invoices.findMany({ with: { client: true, lineItems: true } })`) and avoid manual joins in API routes.

## Features

- **Modern Authentication:** Better Auth with email/password support
- **Type-Safe Database:** Drizzle ORM with full TypeScript support
- **Serverless Ready:** Neon serverless driver (WebSocket pool) for Vercel deployment
- **Resilient IDs:** Bun UUIDv7 for cursor-based navigation and performance
- **Recent Data:** Seed script generates realistic data from the last 6 months
- **Multi-User Support:** Data is distributed randomly among users
- **Auth Flows:** Reset password supported; token is read from URL and validated
- **Modern UI:** Bits UI components with Tailwind CSS 4
- **Svelte 5 Runes:** Uses @attach directives and reactive patterns
- **Responsive Design:** Mobile-first with swipe gestures

## Deployment

The application is configured for Vercel deployment with the Vercel adapter. Ensure your `DATABASE_URL` and `BETTER_AUTH_SECRET` environment variables are set in your Vercel project settings.

## Notes

- Uses Vite 8 (`vite` in `package.json`). Production builds use `rolldownOptions` in `vite.config.ts` (for example `dropConsole`). If issues arise with third-party plugins, see Vite's documentation for compatibility.
- ESLint configuration is in `eslint.config.mjs` and uses Svelte 5 rules and Prettier integration. Prettier is configured in `prettier.config.mjs`. Use `bun run format` before `bun run lint`.
- The project uses Svelte 5's `@attach` directive for modern component patterns and the Spring class for smooth animations.
- Better Auth is configured to use Bun UUIDv7 for user ID generation and includes session caching for performance.
- App configuration lives in `svelte.config.ts` (Vercel adapter, preprocess, Svelte 5 async compiler option).

## License

MIT
