/**
 * Shared ArkType schemas for Elysia `response` maps and API error bodies.
 * Prefer composing from `$lib/validators` Drizzle-backed schemas via `.merge()`.
 */

import { cursorSchema } from "$lib/features/pagination/schemas";
import { type } from "arktype";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-orm/arktype";
import { clients, invoices, lineItems, settings } from "./db/schema";
/** Standard JSON error body for `status(4xx|5xx, { message })`. */
export const apiErrorBodySchema = type({
  message: "string",
});

export const idResponseSchema = type({
  id: cursorSchema,
});

export const deleteSuccessSchema = type({
  success: "true",
});

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

export const invoiceInsertSchema = createInsertSchema(
  invoices,
  invoiceDateRefinement
).omit("userId", "createdAt", "updatedAt");
export const invoiceSelectSchema = createSelectSchema(invoices).omit("userId");
export const invoiceUpdateSchema = createUpdateSchema(
  invoices,
  invoiceDateRefinement
).omit("createdAt", "updatedAt", "userId");

export const lineItemInsertSchema = createInsertSchema(lineItems).omit(
  "invoiceId",
  "userId",
  "createdAt",
  "updatedAt"
);
export const lineItemSelectSchema = createSelectSchema(lineItems).omit(
  "userId",
  "invoiceId"
);
/** Invoice edit form / GET .../line-items/edit — no timestamps on the wire. */
export const lineItemEditRowSchema = lineItemSelectSchema.omit(
  "createdAt",
  "updatedAt"
);
export const lineItemUpdateSchema = createUpdateSchema(lineItems).omit(
  "createdAt",
  "updatedAt",
  "userId",
  "invoiceId"
);

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
