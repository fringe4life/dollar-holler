import pandacss from "@pandacss/vite";
import { sentrySvelteKit } from "@sentry/sveltekit/vite";
import adapter from "@sveltejs/adapter-cloudflare";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { varlockVitePlugin } from "@varlock/vite-integration";
import { DevTools } from "@vitejs/devtools";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, type Plugin } from "vite";
import { svelteDevtools } from "vite-devtools-svelte";
// Chrome DevTools workspace (com.chrome.devtools.json) — separate from @vitejs/devtools
// (Vite/Rolldown UI + vite-devtools-svelte panels). See https://devtools.vite.dev/guide
import devToolsJson from "vite-plugin-devtools-json";
import {
  CLOUDFLARE_WORKERS,
  restoreCloudflareWorkersInDir,
  rewriteCloudflareWorkersSpecifier,
  SERVER_OUTPUT_DIR,
  stubCloudflareWorkersInDir,
} from "./scripts/cloudflare-workers-specifier.ts";

const FILE_REGEX = /[/\\]/;
const ADAPTER_VIRTUAL_WORKERS_PLUGIN =
  "vite-plugin-sveltekit-adapter-cloudflare-virtual-workers-module";

type AdapterResolveId = {
  handler?: (id: string) => { id?: unknown } | undefined;
};

type BundleChunk = {
  type?: string;
  code?: string;
};

let stubImport: string | undefined;

const captureAdapterStubImport = (plugins: readonly Plugin[]) => {
  const adapterPlugin = plugins.find(
    (plugin) => plugin.name === ADAPTER_VIRTUAL_WORKERS_PLUGIN
  );
  const resolveId = adapterPlugin?.resolveId;
  if (!resolveId || typeof resolveId !== "object" || typeof resolveId.handler !== "function") {
    return undefined;
  }
  const result = (resolveId as AdapterResolveId).handler?.(CLOUDFLARE_WORKERS);
  return typeof result?.id === "string" ? result.id : undefined;
};

const rewriteSsrBundle = (bundle: Record<string, BundleChunk>, stub: string) => {
  for (const chunk of Object.values(bundle)) {
    if (chunk.type !== "chunk" || typeof chunk.code !== "string") {
      continue;
    }
    chunk.code = rewriteCloudflareWorkersSpecifier(chunk.code, stub);
  }
};

/**
 * Workaround: rewrite `cloudflare:workers` to the adapter's Node stub during
 * SSR (prerender) and again at preview (after adapt restores the protocol);
 * restore on preview close. Rolldown leaves the protocol as an external, so
 * Node/Bun cannot load SSR output; bare `vite preview` otherwise leaves
 * `file://...virtual-cloudflare-workers.js?<uuid>` in
 * `.svelte-kit/output/server`, which wrangler cannot resolve.
 *
 * @remarks
 * Still required on `@sveltejs/adapter-cloudflare@8.0.0-next.8`
 * (and `@sveltejs/kit@3.0.0-next.31`). Drop when `vite build` + `vite preview`
 * work with a bare `import { env } from "cloudflare:workers"` (no leftover
 * protocol specifier in `.svelte-kit/output/server`); re-verify before deleting.
 *
 * @see https://github.com/sveltejs/kit/issues/17271 — open
 * @see https://github.com/sveltejs/kit/issues/16966 — closed (analyse via Vite
 *   so adapter `resolveId` can stub; only proxy dispose landed)
 * @see https://github.com/fringe4life/dollar-holler/issues/105 — tracking
 */
const stubCloudflareWorkersPlugin = (): Plugin => ({
  name: "stub-cloudflare-workers",
  enforce: "pre",
  configResolved(config) {
    stubImport = captureAdapterStubImport(config.plugins);
  },
  generateBundle(_options, bundle) {
    if (this.environment.name === "ssr" && stubImport) {
      rewriteSsrBundle(bundle, stubImport);
    }
  },
  configurePreviewServer(server) {
    if (!stubImport) {
      return;
    }
    stubCloudflareWorkersInDir(SERVER_OUTPUT_DIR, stubImport);
    return () => {
      const stub = stubImport;
      server.httpServer?.once("close", () => {
        restoreCloudflareWorkersInDir(SERVER_OUTPUT_DIR, stub);
      });
    };
  },
});

export default defineConfig({

  build: {
    rolldownOptions: {
      // Enable Rolldown build-analysis metadata for Vite DevTools panels
      devtools: {},
      output: {
        minify: {
          compress: { dropConsole: true },
          /**
           * Workaround: disable Oxc name mangling so Svelte snippet / `__name`
           * helpers stay callable in prod SSR (otherwise `iN is not a function`).
           *
           * @remarks
           * Still required on `vite@8.3.1` (Rolldown ~1.2.x) with
           * `svelte@5.57.1` / `@sveltejs/kit@3.0.0-next.31`. Drop when default
           * mangling no longer breaks SSR routes; re-verify
           * `bun run build` + preview `/login` `/signup` before deleting.
           *
           * @see https://github.com/rolldown/rolldown/issues/11061 — open
           * @see https://github.com/sveltejs/vite-plugin-svelte/issues/1143 — related
           * @see https://github.com/fringe4life/dollar-holler/pull/66 — introduced
           * @see https://github.com/fringe4life/dollar-holler/issues/114 — tracking
           */
          mangle: false,
        },
      },
    },
  },
  plugins: [
    stubCloudflareWorkersPlugin(),
    visualizer({
      brotliSize: true,
      filename: "stats.html", // written next to project root by default
      gzipSize: true,
      open: process.env.ANALYZE === "true",
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
    // After sveltekit — required for SFC pipeline.
    /**
     * Keep `panda:build` for `styled-system` codegen; `transform: true` folds
     * static `css()` / `cva()` / patterns in `.ts` and `.svelte` (SFC_RE / #3848).
     * Avoid invalid nest keys like `has:{svg}` — unsupported keys silent-bail the
     * whole-file transform and re-ship full `css`/`cva` runtime. Do not use `_icon`
     * for button padding: it targets child `svg` and collapses Lucide icons under
     * `box-sizing: border-box`. Use `&:has(svg)` / a custom condition if needed.
     *
     * @remarks
     * Verified on `@pandacss/vite@2.0.1`. Drop `panda:build` pre-step only if
     * codegen is otherwise covered; re-verify. Watch #3853 for transform diagnostics.
     *
     * @see https://github.com/chakra-ui/panda/pull/3848 — merged in 2.0.1
     * @see https://github.com/chakra-ui/panda/issues/3853 — open: silent no-op on bad keys
     * @see https://github.com/fringe4life/dollar-holler/issues/106 — SFC transform tracking
     * @see https://github.com/fringe4life/dollar-holler/issues/109 — remaining runtime epic
     */
    pandacss({ transform: true }),
  ],
  preview: {
    port: 5173,
  },
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    forwardConsole: true,
    fs: {
      allow: ["styled-system"],
    },
  },
});
