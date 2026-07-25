// import { sentrySvelteKit } from "@sentry/sveltekit";
import adapter from "@sveltejs/adapter-vercel";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { varlockVitePlugin } from "@varlock/vite-integration";
import { DevTools } from "@vitejs/devtools";
import { fileURLToPath } from "node:url";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import { svelteDevtools } from "vite-devtools-svelte";
// Chrome DevTools workspace (com.chrome.devtools.json) — separate from @vitejs/devtools
// (Vite/Rolldown UI + vite-devtools-svelte panels). See https://devtools.vite.dev/guide
import devToolsJson from "vite-plugin-devtools-json";

const FILE_REGEX = /[/\\]/;
const root = (relative: string) =>
  fileURLToPath(new URL(relative, import.meta.url));

export default defineConfig({
  // const shouldUseSentry = mode !== "development";

  // const sentryPlugin = shouldUseSentry
  //   ? sentrySvelteKit({
  //       authToken: process.env.SENTRY_AUTH_TOKEN,
  //       org: "coinnich",
  //       project: "javascript-sveltekit",
  //     })
  //   : [];

  build: {
    rolldownOptions: {
      // Enable Rolldown build-analysis metadata for Vite DevTools panels
      devtools: {},
      output: { minify: { compress: { dropConsole: true } } },
    },
  },
  plugins: [
    // sentryPlugin,
    visualizer({
      brotliSize: true,
      filename: "stats.html", // written next to project root by default
      gzipSize: true,
      template: "treemap", // or "sunburst" / "network"
    }),
    // svelteDevtools must run before sveltekit so transforms hit source first
    svelteDevtools(),
    DevTools(),
    devToolsJson(),
    varlockVitePlugin({
      ssrInjectMode: "resolved-env",
    }),
    sveltekit({
      adapter: adapter(),
      compilerOptions: {
        experimental: {
          async: true,
        },
        runes: ({ filename }) =>
          filename.split(FILE_REGEX).includes("node_modules")
            ? undefined
            : true,
      },
      experimental: {
        remoteFunctions: true,
      },
      preprocess: [vitePreprocess()],
      tracing: {
        server: true,
      },
    }),
  ],
  preview: {
    port: 5173,
  },
  // kit.alias deprecated → prefer tsconfig paths / package.json # imports.
  // resolve.tsconfigPaths alone still fails for some .svelte virtual-module
  // importers under Rolldown (Vite #21889); keep explicit aliases for app paths.
  resolve: {
    alias: {
      $features: root("./src/lib/features"),
      $lib: root("./src/lib"),
      "styled-system": root("./styled-system"),
    },
    tsconfigPaths: true,
  },
  server: {
    forwardConsole: true,
    fs: {
      allow: ["styled-system"],
    },
  },
});
