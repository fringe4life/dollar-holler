import type { Configuration } from "lint-staged";

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
