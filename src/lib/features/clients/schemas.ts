import {
  cursorSchema,
  paginationSchema,
} from "$lib/features/pagination/schemas";
import { clientSelectSchema } from "$lib/validators";
import { type } from "arktype";

export const clientStatusSchema = type({
  clientStatus: "'active' | 'archive'",
});

export const clientSchema = type({
  id: cursorSchema.optional(),
  userId: "string",
  name: "string",
  email: "string?",
  street: "string?",
  city: "string?",
  state: "string?",
  zip: "string?",
  "clientStatus?": "'active' | 'archive' | null | undefined",
});

/** Cursor list row: client + aggregates from list queries. */
export const clientListRowSchema = clientSelectSchema.merge({
  received: "number",
  balance: "number",
});

// export const clientPaginatedListSchema = type({
//   items: clientListRowSchema.array(),
//   paginationMetadata: paginationMetadataSchema,
// });

export const clientPaginatedListSchema = paginationSchema(clientListRowSchema);
export const clientPickerOptionsResponseSchema = type({
  options: type({
    id: cursorSchema,
    name: "string",
  }).array(),
});
/** PATCH /clients/:id status-only response shape. */
export const clientStatusPatchResponseSchema = type({
  id: cursorSchema,
  clientStatus: "'active' | 'archive' | null",
  updatedAt: "Date",
});
