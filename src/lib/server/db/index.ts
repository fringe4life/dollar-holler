import type { D1Database } from "@cloudflare/workers-types";
import { getRequestEvent } from "$app/server";
import { createDb, type AppDatabase } from "./create-db";

const cache = new WeakMap<D1Database, AppDatabase>();

export const getDb = (): AppDatabase => {
  const d1 = getRequestEvent().platform?.env.DB;
  if (!d1) {
    throw new Error("D1 binding DB missing from event.platform.env");
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
