/** @type {import("prettier").Config} */
export default {
  arrowParens: "always",
  bracketSpacing: true,
  printWidth: 80,
  proseWrap: "never",
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "es5",
  useTabs: false,
  plugins: ["prettier-plugin-svelte"],
  overrides: [
    {
      files: "*.svelte",
      options: {
        parser: "svelte",
      },
    },
  ],
};
