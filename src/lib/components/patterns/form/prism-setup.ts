/**
 * Prism 1.x reads these flags off `globalThis.Prism` while the core IIFE
 * boots. Import this module before `prism-core` so:
 * - browsers skip `highlightAll` (would fight `{@html}` in the overlay)
 * - Cloudflare Workers skip the Worker `message` highlighter
 */
const host = globalThis as typeof globalThis & {
  Prism?: {
    disableWorkerMessageHandler?: boolean;
    manual?: boolean;
  };
};

host.Prism = {
  ...host.Prism,
  disableWorkerMessageHandler: true,
  manual: true,
};
