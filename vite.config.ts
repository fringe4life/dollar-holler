import { sentrySvelteKit } from "@sentry/sveltekit";
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
 * Rolldown leaves `cloudflare:workers` as an external protocol import, so
 * Node/Bun cannot load the SSR output. Rewrite to the adapter's Node stub
 * during SSR (prerender) and again at preview (after adapt restores the
 * protocol). Restore on preview close — `vite preview` otherwise leaves
 * `file://...virtual-cloudflare-workers.js?<uuid>` in
 * `.svelte-kit/output/server`, which wrangler cannot resolve.
 *
 * TODO(agent): reevaluate on the next `@sveltejs/kit` / `@sveltejs/adapter-cloudflare`
 * bump. Delete this plugin if `vite build` + `vite preview` work with a bare
 * `import { env } from "cloudflare:workers"` (no leftover protocol specifier
 * in `.svelte-kit/output/server`). Upstream: sveltejs/kit#16966 (analyse
 * via Vite so adapter `resolveId` can stub `cloudflare:workers`).
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
