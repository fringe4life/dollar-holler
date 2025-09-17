# How to Request a README Update (AI Runnable)

Provide ONLY this file in future sessions to have the AI re-scan and update `README.md` without giving full repo context.

## What the AI will do

- Re-scan these sources: `package.json`, `drizzle.config.ts`, `svelte.config.js`, `src/lib/db/schema.ts`, `src/lib/db/seed.ts`, `src/lib/db/index.ts`, `src/lib/auth.ts`, `src/routes/**/*.svelte`, `src/lib/**/*.ts`.
- Update sections in `README.md`:
  - Prerequisites and Getting Started
  - Environment variables block (keep in sync with any `.env` files and `src/lib/db/index.ts`)
  - Database setup commands (Drizzle generate, migrate, seed)
  - Available scripts from `package.json`
  - Tech stack and configuration notes (SvelteKit 5, Svelte 5 runes, Drizzle ORM, Neon, Better Auth, CUID2)
  - Project structure overview
  - **Badge version numbers** (sync with package.json versions)
- Keep wording concise, match existing style, do not over-explain.

## Rules

- Use Bun commands where possible; prefer `bun run` for all tasks.
- If `drizzle.config.ts` exists, reflect its usage (schema path, migrations) and note Drizzle Kit commands.
- Reflect the CSS and linting standards from the project's configuration.
- Mention Better Auth for authentication and CUID2 for ID generation.
- Mention centralized auth configuration in `src/lib/auth.ts`.
- **Badge version sync**: Always check `package.json` for current versions and update README badges accordingly:
  - SvelteKit: `@sveltejs/kit` version
  - Svelte: `svelte` version
  - TypeScript: `typescript` version
  - Drizzle ORM: `drizzle-orm` version
  - Better Auth: `better-auth` version
  - Neon: `@neondatabase/serverless` version
  - CUID2: `@paralleldrive/cuid2` version
- Preserve existing README headings and tone, only patch relevant sections.
- Do not change license wording.

## Quick prompt you can paste

Copy this into the chat with this file attached:

```
Please update README.md based on the codebase. Keep sections accurate and concise, sync env vars with any .env files and src/lib/db/index.ts, prefer Bun commands (bun run ...), include Neon adapter and better-auth notes, ensure scripts from package.json are reflected, and sync badge version numbers with package.json. Keep headings and tone.
```

## Post-update

- Run format: `bun run format` (if available)
- Generate commit message: see `git-commit-msg.md` and run AI to produce message under 140 chars.
