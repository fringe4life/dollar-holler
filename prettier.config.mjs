import ultracite from "ultracite/prettier";

/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  ...ultracite,
  plugins: ["prettier-plugin-svelte", "prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/app.css",
  tailwindFunctions: ["tv", "cn", "clsx", "cva"],
};

export default config;
