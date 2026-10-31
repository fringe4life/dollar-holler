/**
 * Bundle size gate + baseline deltas (gzip).
 * @see https://bundlewatch.io/guide/using-bundlewatch
 * @see https://github.com/fringe4life/dollar-holler/issues/232
 *
 * maxSize fails the job; growth vs main baseline is reported on the
 * `bundlewatch` commit status / results page (no fail-on-percent default).
 */
export default {
  defaultCompression: "gzip",
  // Strip Vite/Rolldown 8-char content hashes: entry/app.XXXX.js → entry/app.js
  normalizeFilenames: /^.*(\.[A-Za-z0-9_-]{8})\.js$/,
  files: [
    {
      path: "./.svelte-kit/output/client/_app/immutable/entry/*.js",
      maxSize: "15kB",
    },
    {
      path: "./.svelte-kit/output/client/_app/immutable/nodes/*.js",
      maxSize: "50kB",
    },
    // Hash-only chunk names still get a hard ceiling even when baselines churn.
    {
      path: "./.svelte-kit/output/client/_app/immutable/chunks/*.js",
      maxSize: "120kB",
    },
    {
      path: "./.svelte-kit/output/client/_app/immutable/og-*.js",
      maxSize: "70kB",
    },
  ],
  ci: {
    trackBranches: ["main"],
  },
};
