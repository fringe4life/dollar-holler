import { type Config } from 'prettier'

const config: Config = {
  // Core formatting options
  useTabs: false,
  singleQuote: true,
  trailingComma: 'es5', // Better for modern JS/TS
  printWidth: 100,
  semi: false,
  arrowParens: 'avoid',

  // Plugins for SvelteKit project
  plugins: ['prettier-plugin-svelte', 'prettier-plugin-tailwindcss'],

  // Tailwind CSS configuration
  tailwindConfig: './tailwind.config.js',
  tailwindFunctions: ['clsx', 'cn', 'tv'],

  // File-specific overrides
  overrides: [
    {
      files: '*.svelte',
      options: {
        parser: 'svelte',
        // Svelte-specific options
        svelteStrictMode: false,
        svelteIndentScriptAndStyle: true,
      },
    },
    {
      files: '*.{css,scss,sass}',
      options: {
        parser: 'css',
        singleQuote: false, // CSS doesn't use quotes
      },
    },
    {
      files: '*.{json,jsonc}',
      options: {
        parser: 'json',
        trailingComma: 'none', // JSON doesn't support trailing commas
      },
    },
    {
      files: '*.md',
      options: {
        parser: 'markdown',
        proseWrap: 'always',
        printWidth: 80, // Shorter lines for readability
      },
    },
  ],
}

export default config
