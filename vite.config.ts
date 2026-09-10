import fs from "node:fs";
import path from "node:path";
import { sentrySvelteKit } from "@sentry/sveltekit";
import adapter from "@sveltejs/adapter-cloudflare";
import { enhancedImages } from "@sveltejs/enhanced-img";
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

const FILE_REGEX = /[/\\]/;
const CLOUDFLARE_WORKERS = "cloudflare:workers";
const SERVER_OUTPUT_DIR = path.resolve(".svelte-kit/output/server");
const ADAPTER_VIRTUAL_WORKERS_PLUGIN =
  "vite-plugin-sveltekit-adapter-cloudflare-virtual-workers-module";

type AdapterResolveId = {
  handler?: (id: string) => { id?: unknown } | undefined;
};

type BundleChunk = {
  type?: string;
  code?: string;
};

const quotedCloudflareWorkers = [
  `"${CLOUDFLARE_WORKERS}"`,
  `'${CLOUDFLARE_WORKERS}'`,
  `\`${CLOUDFLARE_WORKERS}\``,
] as const;

let stubImport: string | undefined;

const rewriteCloudflareWorkersSpecifier = (code: string, stub: string) => {
  const replacement = JSON.stringify(stub);
  let next = code;
  for (const quoted of quotedCloudflareWorkers) {
    next = next.replaceAll(quoted, replacement);
  }
  return next;
};

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

const visitJsFiles = (directory: string, onFile: (full: string) => void) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      visitJsFiles(full, onFile);
      continue;
    }
    if (entry.name.endsWith(".js")) {
      onFile(full);
    }
  }
};

const rewriteJsFilesInDir = (directory: string, stub: string) => {
  if (!fs.existsSync(directory)) {
    return;
  }
  visitJsFiles(directory, (full) => {
    const contents = fs.readFileSync(full, "utf8");
    const next = rewriteCloudflareWorkersSpecifier(contents, stub);
    if (next !== contents) {
      fs.writeFileSync(full, next);
    }
  });
};

/**
 * Rolldown leaves `cloudflare:workers` as an external protocol import, so
 * Node/Bun cannot load the SSR output. Rewrite to the adapter's Node stub
 * during SSR and again at preview (after adapt restores the protocol).
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
  configurePreviewServer() {
    if (stubImport) {
      rewriteJsFilesInDir(SERVER_OUTPUT_DIR, stubImport);
    }
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
    tsconfigPaths: true,
  },
  server: {
    forwardConsole: true,
    fs: {
      allow: ["styled-system"],
    },
  },
});
