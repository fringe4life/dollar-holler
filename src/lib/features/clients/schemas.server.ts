import "#lib/utils/arktype.config.ts";
import { type } from "arktype";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-orm/arktype";
import { cursorSchema } from "#features/pagination/schemas.server.ts";
import { clients } from "#lib/server/db/schema.ts";

export const clientInsertSchema = createInsertSchema(clients).omit(
  "createdAt",
  "updatedAt",
  "userId"
);
export const clientSelectSchema = createSelectSchema(clients).omit("userId");
export const clientUpdateSchema = createUpdateSchema(clients).omit(
  "createdAt",
  "updatedAt",
  "userId"
);

export const clientStatusSchema = type({
  clientStatus: "'active' | 'archive'",
});

const clientReceivedBalanceSchema = type({
  balance: "number",
  received: "number",
});

/** Cursor list row: client + aggregates from list queries. */
export const clientListRowSchema = clientSelectSchema.merge(
  clientReceivedBalanceSchema
);

export const clientPickerOptionSchema = type({
  id: cursorSchema,
  name: "string",
});

export const clientPickerOptionsResponseSchema = type({
  options: clientPickerOptionSchema.array(),
});
