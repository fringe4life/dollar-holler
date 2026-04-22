import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-orm/arktype";
import { settings } from "$lib/server/db/schema";

export const settingsInsertSchema = createInsertSchema(settings).omit(
  "createdAt",
  "updatedAt",
  "userId"
);
export const settingsSelectSchema = createSelectSchema(settings).omit(
  "userId",
  "updatedAt",
  "createdAt"
);
export const settingsUpdateSchema = createUpdateSchema(settings).omit(
  "createdAt",
  "updatedAt",
  "userId"
);
