/**
 * Node stand-in for `cloudflare:workers` during SvelteKit prerender.
 * Alchemy's finish pass bundles this file into the Worker. The import is
 * hidden from Rolldown so workerd still loads the real module, and Node
 * prerender keeps an empty env.
 */
const empty = new Proxy(
  {},
  {
    get() {
      return undefined;
    },
  }
);

const loadWorkers = new Function("return import('cloudflare:' + 'workers')");

let resolved = empty;
try {
  const loaded = await loadWorkers();
  resolved = loaded.env ?? empty;
} catch {
  resolved = empty;
}

export const env = resolved;
