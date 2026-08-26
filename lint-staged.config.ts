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
  "*.{json,md,yml,yaml,html}": "prettier --write --experimental-cli",
  "*.css": ["stylelint --fix", "prettier --write --experimental-cli"],
};

export default config;
