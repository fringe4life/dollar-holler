import { createId } from "@paralleldrive/cuid2";
import { text, timestamp } from "drizzle-orm/pg-core";

// Common timestamp columns to spread into tables
export const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
};

// Helper for CUID primary key text columns
export const cuidPk = (name: string = "id") =>
  text(name).$defaultFn(() => createId()).primaryKey();


