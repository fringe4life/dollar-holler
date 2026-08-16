import { sentrySvelteKit } from "@sentry/sveltekit";
import adapter from "@sveltejs/adapter-cloudflare";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { varlockVitePlugin } from "@varlock/vite-integration";
import { DevTools } from "@vitejs/devtools";
import { fileURLToPath } from "node:url";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, type Plugin } from "vite";
import { svelteDevtools } from "vite-devtools-svelte";
// Chrome DevTools workspace (com.chrome.devtools.json) — separate from @vitejs/devtools
// (Vite/Rolldown UI + vite-devtools-svelte panels). See https://devtools.vite.dev/guide
import devToolsJson from "vite-plugin-devtools-json";

const FILE_REGEX = /[/\\]/;
const root = (relative: string) =>
  fileURLToPath(new URL(relative, import.meta.url));

const ARKTYPE_CONFIG_IMPORT = 'import "#lib/utils/arktype.config.ts";\n';
const ARKTYPE_FROM = /from\s*["'](?:arktype|drizzle-orm\/arktype)["']/;

/** ESM: configure() must run before any `arktype` module evaluates (workerd has no JIT). */
const arktypeJitless = (): Plugin => ({
  enforce: "pre",
  name: "arktype-jitless",
  transform(code, id, options) {
    if (!options?.ssr) {
      return;
    }
    if (id.includes("node_modules") || id.includes("arktype.config")) {
      return;
    }
    if (code.includes("#lib/utils/arktype.config.ts")) {
      return;
    }
    if (!ARKTYPE_FROM.test(code)) {
      return;
    }
    return { code: `${ARKTYPE_CONFIG_IMPORT}${code}`, map: null };
  },
});

export default defineConfig({

  build: {
    rolldownOptions: {
      // Enable Rolldown build-analysis metadata for Vite DevTools panels
      devtools: {},
      output: { minify: { compress: { dropConsole: true } } },
    },
  },
  plugins: [
    arktypeJitless(),
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
    sentrySvelteKit({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "coinnich",
      project: "javascript-sveltekit",
    }),
    enhancedImages(),
    sveltekit({
      adapter: adapter({
        platformProxy: {
          persist: true,
        },
      }),
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
  resolve: {
    alias: {
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
