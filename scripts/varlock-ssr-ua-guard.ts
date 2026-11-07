import type { Plugin } from "vite";

/** Varlock virtual SSR init id (see `@varlock/vite-integration`). */
const VARLOCK_SSR_INIT = "varlock-ssr-init";

const UA_GUARD =
  "typeof navigator !== 'undefined' && navigator.userAgent === 'Cloudflare-Workers'";

/**
 * Start of the Cloudflare env probe block that 1.6.x injects without a UA
 * guard (1.5.x wrapped it in `if (${UA_GUARD}) { … }`).
 */
const CF_PROBE_START = /\{\s*let __cfEnv;/;

/**
 * Workaround: re-wrap Varlock's Cloudflare SSR env probe in the
 * `navigator.userAgent === 'Cloudflare-Workers'` guard that
 * `@varlock/cloudflare-integration@1.5` shipped and docs still describe.
 *
 * Without it, a Cloudflare env probe can run under Node SSR and throw
 * (`Cannot access cloudflare:workers in a prerenderable route` during
 * Analysing routes) or hit `no __VARLOCK_ENV binding`.
 *
 * @remarks
 * Still required on `@varlock/cloudflare-integration@1.6.3` +
 * `@varlock/vite-integration@1.5.5`. Alchemy is the adapter now (no
 * `@sveltejs/adapter-cloudflare`). Drop when upstream restores the UA
 * guard (or equivalent inert-in-Node probe); re-verify `bun run build`
 * (Analysing routes) and `bun run dev` → `/` before deleting.
 * No upstream issue filed yet — say if you want it opened on dmno-dev/varlock.
 *
 * @see https://varlock.dev/integrations/sveltekit/ — docs still claim UA guard
 * @see https://github.com/fringe4life/dollar-holler/issues/257 — tracking
 */
export const varlockSsrUaGuard = (): Plugin => ({
  name: "varlock-ssr-ua-guard",
  transform(code, id) {
    if (!id.includes(VARLOCK_SSR_INIT)) {
      return;
    }
    if (code.includes("Cloudflare-Workers")) {
      return;
    }
    if (!code.includes("cloudflare:workers")) {
      return;
    }

    const startMatch = CF_PROBE_START.exec(code);
    if (!startMatch || startMatch.index === undefined) {
      return;
    }
    const start = startMatch.index;

    const afterProbe = code.indexOf("import { initVarlockRuntime }", start);
    if (afterProbe < 0) {
      return;
    }

    const probe = code.slice(start, afterProbe);
    const wrapped = `if (${UA_GUARD}) ${probe}`;
    return {
      code: `${code.slice(0, start)}${wrapped}${code.slice(afterProbe)}`,
      map: null,
    };
  },
});
