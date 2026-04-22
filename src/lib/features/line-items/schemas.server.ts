import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-orm/arktype";
import { lineItems } from "$lib/server/db/schema";

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
