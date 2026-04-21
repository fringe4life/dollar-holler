import { paginationSchema } from "$lib/features/pagination/schemas";
import { invoiceSelectSchema } from "$lib/server/schemas";
import { type } from "arktype";

/** Cursor list row: invoice + client name + line total. */
export const invoiceListRowSchema = invoiceSelectSchema.merge({
  total: "number",
  name: "string",
});

export const invoicePaginatedListSchema =
  paginationSchema(invoiceListRowSchema);

/** Integer cents per bucket (matches `InvoiceListResponse.total`). */
export const clientInvoiceSummarySchema = type({
  overdue: "number",
  outstanding: "number",
  draft: "number",
  paid: "number",
  grandTotal: "number",
});
