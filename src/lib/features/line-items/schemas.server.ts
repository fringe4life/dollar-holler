import "#lib/utils/arktype.config.ts";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-orm/arktype";
import { lineItems } from "#lib/server/db/schema.ts";

export const lineItemInsertSchema = createInsertSchema(lineItems).omit(
  "invoiceId",
  "userId",
  "createdAt",
  "updatedAt"
);
const lineItemSelectSchema = createSelectSchema(lineItems).omit(
  "userId",
  "invoiceId"
);
/** Invoice edit form / `listLineItemsForEdit` — no timestamps on the wire. */
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
