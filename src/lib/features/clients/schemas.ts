import {
  cursorSchema,
  paginationSchema,
} from "$lib/features/pagination/schemas";
import { clientSelectSchema } from "$lib/validators";
import { type } from "arktype";

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
