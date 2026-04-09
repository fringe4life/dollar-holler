import { lineItemsSchema } from "$lib/features/line-items/schemas/schemas";
import {
  cursorSchema,
  paginationSchema,
} from "$lib/features/pagination/schemas";
import { invoiceSelectSchema } from "$lib/validators";
import { type } from "arktype";

/** Cursor list row: invoice + client name + line total. */
export const invoiceListRowSchema = invoiceSelectSchema.merge({
  client: type({ name: "string" }),
  total: "number",
});

export const invoicePaginatedListSchema =
  paginationSchema(invoiceListRowSchema);

export const invoiceSchema = type({
  id: cursorSchema.optional(),
  userId: "string",
  invoiceNumber: "string",
  clientId: cursorSchema,
  subject: "string?",
  issueDate: "string.date.parse",
  dueDate: "string.date.parse",
  discount: "number?",
  notes: "string?",
  terms: "string?",
  "invoiceStatus?": "'draft' | 'sent' | 'paid' | null | undefined",
});

export const invoiceUpsertBodySchema = invoiceSchema.and(lineItemsSchema);
