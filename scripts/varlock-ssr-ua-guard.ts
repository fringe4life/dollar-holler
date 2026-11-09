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

const INIT_CALL = "initVarlockRuntime();";

/**
 * Alchemy + Varlock (varlock.dev Cloudflare “non-wrangler deploy tools”,
 * varlock#735): `varlock run` injects the host; Alchemy binds individual
 * Worker secrets/vars. There is no `__VARLOCK_ENV` blob. Skip in-worker
 * Varlock init so boot does not throw `initVarlockEnv failed`. Node
 * prerender / `varlock run` still have the blob and keep init.
 */
export const VARLOCK_ALCHEMY_INIT_GUARD = `if (globalThis.__varlockLoadedEnv || globalThis.__varlockEncryptedEnv || globalThis.process?.env?.__VARLOCK_ENV) ${INIT_CALL}`;

const wrapCloudflareProbe = (code: string): string => {
  if (code.includes("Cloudflare-Workers")) {
    return code;
  }
  if (!code.includes("cloudflare:workers")) {
    return code;
  }

  const startMatch = CF_PROBE_START.exec(code);
  if (!startMatch || startMatch.index === undefined) {
    return code;
  }
  const start = startMatch.index;

  const afterProbe = code.indexOf("import { initVarlockRuntime }", start);
  if (afterProbe < 0) {
    return code;
  }

  const probe = code.slice(start, afterProbe);
  const wrapped = `if (${UA_GUARD}) ${probe}`;
  return `${code.slice(0, start)}${wrapped}${code.slice(afterProbe)}`;
};

const skipInitWithoutBlob = (code: string): string => {
  if (code.includes(VARLOCK_ALCHEMY_INIT_GUARD) || !code.includes(INIT_CALL)) {
    return code;
  }
  return code.replace(INIT_CALL, VARLOCK_ALCHEMY_INIT_GUARD);
};

/**
 * Workaround: re-wrap Varlock's Cloudflare SSR env probe in the
 * `navigator.userAgent === 'Cloudflare-Workers'` guard that
 * `@varlock/cloudflare-integration@1.5` shipped and docs still describe.
 *
 * Without it, a Cloudflare env probe can run under Node SSR and throw
 * (`Cannot access cloudflare:workers in a prerenderable route` during
 * Analysing routes) or hit `no __VARLOCK_ENV binding`.
 *
 * Also skips `initVarlockRuntime()` when no env blob is present — the
 * Alchemy path (host `varlock run`, Worker bindings, no `__VARLOCK_ENV`).
 *
 * @remarks
 * Still required on `@varlock/vite-integration@1.5.5`. Alchemy is the
 * adapter now (no `@sveltejs/adapter-cloudflare`). Drop the UA wrap when
 * upstream restores it; drop the init guard when varlock#735 ships a
 * public `__VARLOCK_ENV` producer. Re-verify `bun run build` (Analysing
 * routes), `bun run dev` → `/`, and Worker boot without `initVarlockEnv
 * failed`.
 *
 * @see https://varlock.dev/integrations/cloudflare/ — Alchemy skips in-worker layer
 * @see https://github.com/dmno-dev/varlock/issues/735
 * @see https://github.com/fringe4life/dollar-holler/issues/257 — UA tracking
 */
export const varlockSsrUaGuard = (): Plugin => ({
  name: "varlock-ssr-ua-guard",
  transform(code, id) {
    if (!id.includes(VARLOCK_SSR_INIT)) {
      return;
    }

    const next = skipInitWithoutBlob(wrapCloudflareProbe(code));
    if (next === code) {
      return;
    }
    return {
      code: next,
      map: null,
    };
  },
});
