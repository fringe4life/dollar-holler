import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import pandacss from "@pandacss/vite";
import { sentrySvelteKit } from "@sentry/sveltekit/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { FontaineTransform } from "fontaine";
import { devtools as ogygiaDevtools } from "@ogygia/devtools/vite";
import { ogygia } from "ogygia/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { varlockVitePlugin } from "@varlock/vite-integration";
import { DevTools } from "@vitejs/devtools";
import { visualizer } from "rollup-plugin-visualizer";
import { svelteSitemap } from "svelte-sitemap/vite";
import { defineConfig } from "vite";
import { svelteDevtools } from "vite-devtools-svelte";
// Chrome DevTools workspace (com.chrome.devtools.json) — separate from @vitejs/devtools
// (Vite/Rolldown UI + vite-devtools-svelte panels). See https://devtools.vite.dev/guide
import devToolsJson from "vite-plugin-devtools-json";
import { ogygiaNodeImportsBridge } from "./scripts/ogygia-node-imports-bridge.ts";
import { varlockSsrUaGuard } from "./scripts/varlock-ssr-ua-guard.ts";

/** Public site origin used in robots.txt and the build-time sitemap. */
const SITE_ORIGIN = "https://dolla-holla.org";

const require = createRequire(import.meta.url);
const FONTSOURCE_SPEC =
  /^(?<pkg>@fontsource(?:-variable)?\/[^/]+)\/(?<rest>.*)$/;

/** Map Fontsource package URLs in `@font-face` src to files on disk. */
const resolveFontainePath = (id: string): string | URL => {
  const match = FONTSOURCE_SPEC.exec(id);
  const pkg = match?.groups?.pkg;
  const rest = match?.groups?.rest;
  if (pkg === undefined || rest === undefined) {
    return id;
  }

  return join(dirname(require.resolve(`${pkg}/package.json`)), rest);
};

const FILE_REGEX = /[/\\]/;

export default defineConfig(({ mode }) => ({
  build: {
    rolldownOptions: {
      // Enable Rolldown build-analysis metadata for Vite DevTools panels
      devtools: {},
      output: {
        minify: {
          compress: { dropConsole: true },
          // Oxc mangling re-enabled: SSR crash was Wrangler/esbuild
          // `alwaysStrict` + Annex B hoisting (see tsconfig.wrangler.json / #114),
          // not Oxc itself. Keep compress/dropConsole.
        },
      },
    },
  },
  // Vite 8 dev prebundle only. Does not change `vite build` or the Worker.
  optimizeDeps: {
    include: ["effect"],
  },
  plugins: [
    /**
     * Fontaine (#213): metric-matched `{family} fallback` @font-face
     * (size-adjust / overrides). Panda stacks are CSS variables, so tokens
     * list the fallback name too. Kept after a qualitative swap check on `/`
     * (body + Kalam) and a money route (Space Mono) in Vite preview —
     * interim stacks sit close enough that list rows / hero copy do not
     * reflow when the woff2 arrives. Pure CSS; does not speed downloads.
     */
    FontaineTransform.vite({
      fallbacks: {
        Kalam: ["Comic Sans MS"],
        "Source Sans 3 Variable": ["Arial", "Roboto"],
        "Space Mono": ["Courier New"],
      },
      resolvePath: resolveFontainePath,
    }),
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
    // Cloudflare adapter detected → runtime loader via @varlock/cloudflare-integration
    // (do not force ssrInjectMode: "resolved-env"; plugin rejects that on CF builds).
    varlockVitePlugin(),
    // After varlock so `\0varlock-ssr-init` exists; restores UA guard (see script).
    varlockSsrUaGuard(),
    sentrySvelteKit({
      // Dummy .env.test token must not upload or fail CI builds (#148).
      autoUploadSourceMaps: process.env.VARLOCK_ENV !== "test",
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "coinnich",
      project: "javascript-sveltekit",
    }),
    /**
     * Workaround: Vite `resolveSubpathImports` rebases `#…` imports against
     * `dirname(importer)`. For ogygia’s `virtual:ogygia/island/…` that yields
     * `../../styled-system/…`, then `path.normalize(join(virtualDir, …))` collapses to
     * bare `styled-system/css/cx.js`. Ogygia’s `resolve(source, host)` then fails
     * (checks package `exports` only). Bridge remaps every `#bare` / `#bare/*`
     * imports entry (retries `#id`, else on-disk path). Prod `vite build` skips
     * import-analysis (`isBundled`) so the collapse does not show there.
     *
     * Plugin order before `ogygia()` is required so island resolve sees the remap.
     *
     * @remarks
     * Still required on `vite@8.3.6` + `ogygia@0.12.2` with `@sveltejs/kit@3.1.1` for
     * landing/auth islands (`virtual:ogygia/island` → bare `styled-system/css/cx.js`).
     * Re-checked 8.3.6: its `#` fix is optimizer conditions only
     * (vitejs/vite#23959 / #23946), not virtual-importer collapse. Drop when Vite
     * stops emitting bare ids for virtual importers; re-verify `/` and `/login` in **dev**.
     * No upstream Vite issue filed yet (filing target is vitejs/vite, not ogygia).
     *
     * @see https://github.com/fringe4life/dollar-holler/issues/228 — this upgrade + bridge
     * @see https://github.com/fringe4life/dollar-holler/issues/215 — Vite tracking
     * @see https://github.com/fringe4life/dollar-holler/issues/209 — Vite collapse tracking
     * @see https://github.com/fringe4life/dollar-holler/issues/208 — related Kit 3 env rename
     */
    ogygiaNodeImportsBridge(),
    // Before sveltekit so island import attributes are rewritten first.
    // Feature plugins list beside ogygia() (not as ogygia({ plugins })) — 0.11 split.
    ogygia(),
    ...(mode !== "production"
      ? [ogygiaDevtools({ profiler: true })]
      : []),
    sveltekit({
      compilerOptions: {
        experimental: {
          async: true,
        },
        runes: ({ filename }) =>
          filename.split(FILE_REGEX).includes("node_modules")
            ? undefined
            : true,
      },
      csrf: {
        trustedOrigins:
          mode === "production" ? [] : ["http://127.0.0.1:5173"],
      },
      experimental: {
        remoteFunctions: true,
      },
      preprocess: [vitePreprocess()],
      tracing: {
        server: true,
      },
    }),
    // After sveltekit so the Cloudflare adapt output exists under outDir.
    svelteSitemap({
      additional: ["/"],
      changeFreq: "weekly",
      domain: SITE_ORIGIN,
      ignore: ["404.html"],
      outDir: ".svelte-kit/cloudflare",
      // Keep parity with the old PUBLIC_PATHS allowlist (`/` only).
      transform: (_config, path) =>
        path === "/" ? { priority: 1 } : null,
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
     * Verified on `@pandacss/vite@2.1.0`. Drop `panda:build` pre-step only if
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
    host: "127.0.0.1",
    port: 5173,
    fs: {
      allow: ["styled-system"],
    },
  },
}));
