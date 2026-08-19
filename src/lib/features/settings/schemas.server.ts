import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-orm/valibot";
import { omit } from "valibot";
import { settings } from "#lib/server/db/schema.ts";

export const settingsInsertSchema = omit(createInsertSchema(settings), [
  "createdAt",
  "updatedAt",
  "userId",
]);

export const settingsSelectSchema = omit(createSelectSchema(settings), [
  "userId",
  "updatedAt",
  "createdAt",
]);

export const settingsUpdateSchema = omit(createUpdateSchema(settings), [
  "createdAt",
  "updatedAt",
  "userId",
]);
