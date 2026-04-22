import {
  cursorSchema,
  paginationSchema,
} from "$features/pagination/schemas.server";
import { clients } from "$lib/server/db/schema";
import { type } from "arktype";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-orm/arktype";

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

export const clientReceivedBalanceSchema = type({
  received: "number",
  balance: "number",
});

/** Cursor list row: client + aggregates from list queries. */
export const clientListRowSchema = clientSelectSchema.merge(
  clientReceivedBalanceSchema
);

export const clientPickerOptionSchema = type({
  id: cursorSchema,
  name: "string",
});

export const clientPaginatedListSchema = paginationSchema(clientListRowSchema);
export const clientPickerOptionsResponseSchema = type({
  options: clientPickerOptionSchema.array(),
});
/** PATCH /clients/:id status-only response shape. */
export const clientStatusPatchResponseSchema = type({
  id: cursorSchema,
  updatedAt: "Date",
}).merge(clientStatusSchema);
