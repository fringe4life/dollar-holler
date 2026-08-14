import type { D1Database } from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import { tableRelations } from "./relations";

export type AppDatabase = ReturnType<typeof createDb>;

export const createDb = (d1: D1Database) =>
  drizzle(d1, { relations: tableRelations });
