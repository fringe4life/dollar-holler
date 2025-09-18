# Dollar Holler

A modern invoice management application built with SvelteKit 5, featuring Better Auth authentication, Drizzle ORM (relations API) with Neon database, and CUID2 for resilient ID generation.

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

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@hostname:port/database"
   # Optionally used by auth/email flows
   PUBLIC_BASE_URL="http://localhost:5173"
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

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run check` - Run Svelte check
- `bun run db:generate` - Generate Drizzle migrations
- `bun run db:migrate` - Run database migrations
- `bun run db:seed` - Seed database with sample data
- `bun run db:studio` - Open Drizzle Studio
- `bun run db:push` - Push schema directly to the database

## Tech Stack

- **Framework:** SvelteKit 5 with Svelte 5 runes
- **Database:** PostgreSQL with Neon serverless
- **ORM:** Drizzle ORM with Neon HTTP driver
- **Authentication:** Better Auth with email/password
- **ID Generation:** CUID2 for resilient, cursor-friendly IDs
- **Deployment:** Vercel adapter
- **Package Manager:** Bun
- **Validation:** ArkType for runtime-safe form validation

## Project Structure

```
src/
├── lib/
│   ├── auth.ts          # Better Auth configuration
│   ├── db/
│   │   ├── index.ts     # Database connection (Neon HTTP)
│   │   ├── schema.ts    # Drizzle schema definitions
│   │   └── seed.ts      # Database seeding script
│   └── ...
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

## Deployment

The application is configured for Vercel deployment with the Vercel adapter. Ensure your `DATABASE_URL` environment variable is set in your Vercel project settings.

## License

MIT