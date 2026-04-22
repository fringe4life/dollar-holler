import { paginationSchema } from "$features/pagination/schemas.server";
import { invoices } from "$lib/server/db/schema";
import { type } from "arktype";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-orm/arktype";

/**
 * JSON bodies encode dates as ISO strings; Drizzle arktype expects `Date`.
 * Accept `string | Date`, reject unparseable values, morph to `Date`.
 * @see https://orm.drizzle.team/docs/arktype#refinements
 */
const isoTimestampFromWire = () =>
  type("string | Date")
    .narrow((v) => {
      const d = v instanceof Date ? v : new Date(v);
      return !Number.isNaN(d.getTime());
    })
    .pipe((v) => (v instanceof Date ? v : new Date(v)));

const invoiceDateRefinement = {
  issueDate: isoTimestampFromWire,
  dueDate: isoTimestampFromWire,
} as const;

export const invoiceInsertSchema = createInsertSchema(
  invoices,
  invoiceDateRefinement
).omit("userId", "createdAt", "updatedAt");
export const invoiceSelectSchema = createSelectSchema(invoices).omit("userId");
export const invoiceUpdateSchema = createUpdateSchema(
  invoices,
  invoiceDateRefinement
).omit("createdAt", "updatedAt", "userId");

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
