import { includeIgnoreFile } from "@eslint/compat";
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import { fileURLToPath } from "node:url";
import ts from "typescript-eslint";
import svelteConfig from "./svelte.config.js";

const gitignorePath = fileURLToPath(new URL("./.gitignore", import.meta.url));

export default [
  includeIgnoreFile(gitignorePath),
  {
    ignores: [
      // Build outputs
      ".svelte-kit/",
      "build/",
      "dist/",
      // Dependencies
      "node_modules/",
      // Database
      "*.db",
      "*.sqlite",
      // Environment files
      ".env",
      ".env.local",
      ".env.*.local",
      // Logs
      "*.log",
      // Package managers
      "package-lock.json",
      "pnpm-lock.yaml",
      "yarn.lock",
      "bun.lock",
      "bun.lockb",
      // Generated files
      "drizzle/",
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  prettier,
  ...svelte.configs.prettier,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // "no-undef": "off",
      // Disable rules that conflict with Tailwind CSS v4 @rules
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: [".svelte"],
        parser: ts.parser,
        svelteConfig,
      },
    },
    rules: {
      // Disable rules that conflict with Tailwind CSS v4 @rules in Svelte files
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["**/*.css", "**/*.scss", "**/*.sass"],
    rules: {
      // Disable all rules for CSS files to avoid conflicts with Tailwind CSS v4
      // "no-undef": "off",
      // "no-unused-vars": "off",
      // "@typescript-eslint/no-unused-vars": "off",
    },
  },
];
