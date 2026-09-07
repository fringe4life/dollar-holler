/**
 * Prism 1.x reads these flags off `globalThis.Prism` while the core IIFE
 * boots. Import this module before `prism-core` so:
 * - browsers skip `highlightAll` (would fight `{@html}` in the overlay)
 * - Cloudflare Workers skip the Worker `message` highlighter
 */
const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const existingPrism: unknown = Reflect.get(globalThis, "Prism");
let previousFlags: Record<string, unknown> = {};
if (isObjectRecord(existingPrism)) {
  previousFlags = existingPrism;
}

Reflect.set(globalThis, "Prism", {
  ...previousFlags,
  disableWorkerMessageHandler: true,
  manual: true,
});
