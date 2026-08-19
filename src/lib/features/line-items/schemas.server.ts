import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-orm/valibot";
import { omit, optional } from "valibot";
import { cursorSchema } from "#lib/schemas/cursor-id.ts";
import { lineItems } from "#lib/server/db/schema.ts";

export const lineItemInsertSchema = omit(
  createInsertSchema(lineItems, {
    id: () => optional(cursorSchema),
    invoiceId: () => cursorSchema,
  }),
  ["invoiceId", "userId", "createdAt", "updatedAt"]
);

const lineItemSelectSchema = omit(
  createSelectSchema(lineItems, {
    id: () => cursorSchema,
    invoiceId: () => cursorSchema,
  }),
  ["userId", "invoiceId"]
);

/** Invoice edit form / `listLineItemsForEdit` — no timestamps on the wire. */
export const lineItemEditRowSchema = omit(lineItemSelectSchema, [
  "createdAt",
  "updatedAt",
]);

export const lineItemUpdateSchema = omit(
  createUpdateSchema(lineItems, {
    id: () => optional(cursorSchema),
    invoiceId: () => optional(cursorSchema),
  }),
  ["createdAt", "updatedAt", "userId", "invoiceId"]
);
