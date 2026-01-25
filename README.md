# Dollar Holler

<div align="center">

[![SvelteKit](https://img.shields.io/badge/SvelteKit-2.50.1-orange?logo=svelte&logoColor=white)](https://kit.svelte.dev/) [![Svelte](https://img.shields.io/badge/Svelte-5.48.2-red?logo=svelte&logoColor=white)](https://svelte.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-0.45.1-green?logo=postgresql&logoColor=white)](https://orm.drizzle.team/) [![Better Auth](https://img.shields.io/badge/Better%20Auth-1.4.17-purple?logo=auth0&logoColor=white)](https://www.better-auth.com/) [![Elysia](https://img.shields.io/badge/Elysia-1.4.22-pink?logo=bun&logoColor=white)](https://elysiajs.com/) [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.18-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

A modern invoice management application built with SvelteKit 5, featuring Better Auth authentication, Drizzle ORM with Neon database, and CUID2 for resilient ID generation.

## Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- [Neon](https://neon.tech/) account for PostgreSQL database
- [Vercel](https://vercel.com/) account for deployment (optional)

## Getting Started

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd dollar-holler
   bun install
   ```

2. **Set up environment variables:** Create a `.env` file in the root directory:

   ```env
   DATABASE_URL="postgresql://username:password@hostname:port/database"
   PUBLIC_BASE_URL="http://localhost:5173"
   BETTER_AUTH_SECRET="your-strong-secret"
   ```

3. **Set up the database:**

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

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run check` - Run Svelte check
- `bun run check:watch` - Run Svelte check in watch mode
- `bun run db:generate` - Generate Drizzle migrations
- `bun run db:migrate` - Run database migrations
- `bun run db:seed` - Seed database with sample data
- `bun run db:studio` - Open Drizzle Studio
- `bun run db:push` - Push schema directly to the database
- `bun run format` - Format source with Prettier
- `bun run lint` - Run Prettier check and ESLint

## Tech Stack

- **Framework:** SvelteKit 5 with Svelte 5 runes
- **API Layer:** ElysiaJS for type-safe API routes
- **Database:** PostgreSQL with Neon serverless
- **ORM:** Drizzle ORM with Neon HTTP driver
- **Authentication:** Better Auth with email/password
- **ID Generation:** CUID2 for resilient, cursor-friendly IDs
- **Deployment:** Vercel adapter
- **Package Manager:** Bun
- **Validation:** ArkType for runtime-safe form validation
- **Bundler:** rolldown-vite (Vite alias) for faster builds
- **UI Components:** Bits UI with Tailwind CSS
- **Styling:** Tailwind CSS 4 with Tailwind Variants

## Project Structure

```
src/
├── lib/
│   ├── auth.ts          # Better Auth configuration
│   ├── auth-client.ts   # Client-side auth utilities
│   ├── db/
│   │   ├── index.ts     # Database connection (Neon HTTP)
│   │   ├── schema.ts    # Drizzle schema definitions
│   │   ├── seed.ts      # Database seeding script
│   │   └── migrate.ts   # Migration utilities
│   ├── elysia/
│   │   ├── index.ts     # ElysiaJS app with mounted routes
│   │   ├── auth-plugin.ts # Better Auth integration plugin
│   │   └── routes/      # API route modules (clients, invoices, settings)
│   ├── components/      # Reusable UI components
│   │   ├── ui/          # Bits UI components
│   │   └── ...          # Custom components
│   ├── attachments/     # Svelte 5 @attach directives
│   ├── stores/          # Svelte stores (client, invoice, settings)
│   ├── utils/           # Helper functions
│   └── validators.ts    # ArkType validation schemas
├── routes/              # SvelteKit routes
└── app.html            # HTML template
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

All tables use CUID2 for primary keys and include proper foreign key relationships with cascade deletes.

The application uses Drizzle's relations to simplify nested queries (e.g., `db.query.invoices.findMany({ with: { client: true, lineItems: true } })`) and avoid manual joins in API routes.

## Features

- **Modern Authentication:** Better Auth with email/password support
- **Type-Safe Database:** Drizzle ORM with full TypeScript support
- **Serverless Ready:** Neon HTTP driver for Vercel deployment
- **Resilient IDs:** CUID2 for cursor-based navigation and better performance
- **Recent Data:** Seed script generates realistic data from the last 6 months
- **Multi-User Support:** Data is distributed randomly among users
- **Auth Flows:** Reset password supported; token is read from URL and validated
- **Modern UI:** Bits UI components with Tailwind CSS 4
- **Svelte 5 Runes:** Uses @attach directives and reactive patterns
- **Responsive Design:** Mobile-first with swipe gestures

## Deployment

The application is configured for Vercel deployment with the Vercel adapter. Ensure your `DATABASE_URL` and `BETTER_AUTH_SECRET` environment variables are set in your Vercel project settings.

## Notes

- Uses `rolldown-vite` by aliasing `vite` in `package.json` (drop-in replacement). If issues arise with third-party plugins, see Vite's rolldown guide for `withFilter` and environment APIs.
- ESLint configuration is in `eslint.config.mjs` and uses Svelte 5 rules and Prettier integration. Use `bun run format` before `bun run lint`.
- The project uses Svelte 5's new `@attach` directive for modern component patterns and the Spring class for smooth animations.
- Better Auth is configured with CUID2 for user ID generation and includes session caching for performance.

## License

MIT
