import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error("Missing DATABASE_URL environment variable");
}

const sql = neon(DATABASE_URL);
export const db = drizzle(sql, { schema });
