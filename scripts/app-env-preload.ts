import { mock } from "bun:test";

// Bun `[test].preload` only. Lives under `scripts/` so Vite/Alchemy SSR
// (and src-tree crawlers like svelte-shaker) never see `bun:test`.
// Unit tests always use committed `.env.test` dummies, even if the shell
// inherited development or production. Set this before `varlock/auto-load`.
process.env.VARLOCK_ENV = "test";

mock.module("$app/env", () => ({
  browser: true,
  building: false,
  dev: false,
}));

mock.module("$app/server", () => ({
  getRequestEvent: () => {
    throw new Error("unit test does not read the request");
  },
}));
