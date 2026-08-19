import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-orm/valibot";
import { array, number, object, omit, optional, string } from "valibot";
import { cursorSchema } from "#features/pagination/schemas.ts";
import { clients } from "#lib/server/db/schema.ts";

export const clientInsertSchema = omit(
  createInsertSchema(clients, { id: () => optional(cursorSchema) }),
  ["createdAt", "updatedAt", "userId"]
);

export const clientSelectSchema = omit(
  createSelectSchema(clients, { id: () => cursorSchema }),
  ["userId"]
);

export const clientUpdateSchema = omit(
  createUpdateSchema(clients, { id: () => optional(cursorSchema) }),
  ["createdAt", "updatedAt", "userId"]
);

/** Cursor list row: client + aggregates from list queries. */
export const clientListRowSchema = object({
  ...clientSelectSchema.entries,
  balance: number(),
  received: number(),
});

export const clientPickerOptionSchema = object({
  id: cursorSchema,
  name: string(),
});

export const clientPickerOptionsResponseSchema = object({
  options: array(clientPickerOptionSchema),
});
