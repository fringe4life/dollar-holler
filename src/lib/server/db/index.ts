import type { D1Database } from "@cloudflare/workers-types";
import { getRequestEvent } from "$app/server";
import { createDb, type AppDatabase } from "./create-db";

const cache = new WeakMap<D1Database, AppDatabase>();

/**
 * D1 from Alchemy / Kit `platform.env` (Worker shim and `alchemy dev`
 * emulator). Missing or prerender-guarded access returns undefined.
 */
export const tryGetD1 = (): D1Database | undefined => {
  try {
    return getRequestEvent().platform?.env?.DB;
  } catch {
    return undefined;
  }
};

/**
 * Real `createDb` instance for the current request’s D1 binding.
 * Prefer this over preparing against the Proxy so WeakMap caches key by
 * AppDatabase (not the singleton Proxy) and never capture a missing env at
 * module load.
 */
export const getDb = (): AppDatabase => {
  const d1 = tryGetD1();
  if (!d1) {
    throw new Error(
      "D1 binding DB missing from platform.env. Use `bun run dev` (`varlock run -- bun x alchemy dev --stage dev`), not bare `vite dev`. Local persist is `.alchemy/local/d1`."
    );
  }
  const cached = cache.get(d1);
  if (cached) {
    return cached;
  }
  const instance = createDb(d1);
  cache.set(d1, instance);
  return instance;
};

export const db: AppDatabase = new Proxy({} as AppDatabase, {
  get(_target, property, receiver) {
    const instance = getDb();
    const value = Reflect.get(instance, property, receiver);
    return typeof value === "function"
      ? (value as (...args: never[]) => unknown).bind(instance)
      : value;
  },
});
