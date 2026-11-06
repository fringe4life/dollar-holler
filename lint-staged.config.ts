import type { Configuration } from "lint-staged";

/** Dummy literals in `.env.test` — no Bitwarden fetch (same as CI `VARLOCK_ENV=test`). */
process.env.VARLOCK_ENV = "test";

const config: Configuration = {
  "*.{js,ts,svelte}": [
    "eslint --fix --no-warn-ignored",
    "prettier --write --experimental-cli",
    // Function form: no staged filenames (project-wide). Array = sequential, no shell.
    () => ["svelte-kit sync", "svelte-check --tsconfig ./tsconfig.json"],
  ],
  // Fast lockfile gate only — do not hang off the svelte-check path (#233).
  // `dedupe` rewrites bun.lock when ranges already allow collapsing versions; lint-staged re-stages it.
  "{package.json,bun.lock}": () => ["bun run dedupe", "bun run audit:deps"],
  "*.{json,md,yml,yaml,html}": "prettier --write --experimental-cli",
  "*.css": ["stylelint --fix", "prettier --write --experimental-cli"],
};

export default config;
