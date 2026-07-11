// import { sentrySvelteKit } from "@sentry/sveltekit";
import adapter from "@sveltejs/adapter-vercel";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { varlockVitePlugin } from "@varlock/vite-integration";
// Chrome DevTools workspace (com.chrome.devtools.json); not the same as Vite 8's optional @vitejs/devtools
// (build analysis UI, build-only for now — see https://devtools.vite.dev/guide). No migration required.
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import devToolsJson from "vite-plugin-devtools-json";

const FILE_REGEX = /[/\\]/;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- SvelteKit typescript.config param is Record<string, any>
type Config = Record<string, any>;

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
    devToolsJson(),
    varlockVitePlugin({
      ssrInjectMode: "resolved-env",
    }),
    sveltekit({
      adapter: adapter(),
      alias: {
        $features: "./src/lib/features",
        $lib: "./src/lib",
        "styled-system": "./styled-system",
      },
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
      typescript: {
        config: (config: Config) => ({
          ...config,
          include: [
            ...config.include.filter(
              (entry: string) => !entry.includes("styled-system")
            ),
            "../panda.config.ts",
            "../drizzle.config.ts",
          ],
        }),
      },
    }),
  ],
  preview: {
    port: 5173,
  },
  server: {
    forwardConsole: true,
    fs: {
      allow: ["styled-system"],
    },
  },
});
