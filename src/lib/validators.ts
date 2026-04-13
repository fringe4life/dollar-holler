import { type } from "arktype";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-orm/arktype";
import { clients, invoices, lineItems, settings } from "./db/schema";

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

// Business logic schemas
export const clientInsertSchema = createInsertSchema(clients);
export const clientSelectSchema = createSelectSchema(clients);
export const clientUpdateSchema = createUpdateSchema(clients);

export const invoiceInsertSchema = createInsertSchema(
  invoices,
  invoiceDateRefinement
).omit("userId", "createdAt", "updatedAt");
export const invoiceSelectSchema = createSelectSchema(invoices);
export const invoiceUpdateSchema = createUpdateSchema(
  invoices,
  invoiceDateRefinement
);

export const lineItemInsertSchema = createInsertSchema(lineItems).omit(
  "invoiceId",
  "userId"
);
export const lineItemSelectSchema = createSelectSchema(lineItems);
export const lineItemUpdateSchema = createUpdateSchema(lineItems);

export const settingsInsertSchema = createInsertSchema(settings);
export const settingsSelectSchema = createSelectSchema(settings);
export const settingsUpdateSchema = createUpdateSchema(settings);
