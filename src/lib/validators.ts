import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-orm/arktype";
import { clients, invoices, lineItems, settings } from "./db/schema";
// Business logic schemas
export const clientInsertSchema = createInsertSchema(clients);
export const clientSelectSchema = createSelectSchema(clients);
export const clientUpdateSchema = createUpdateSchema(clients);

export const invoiceInsertSchema = createInsertSchema(invoices);
export const invoiceSelectSchema = createSelectSchema(invoices);
export const invoiceUpdateSchema = createUpdateSchema(invoices);

export const lineItemInsertSchema = createInsertSchema(lineItems);
export const lineItemSelectSchema = createSelectSchema(lineItems);
export const lineItemUpdateSchema = createUpdateSchema(lineItems);

export const settingsInsertSchema = createInsertSchema(settings);
export const settingsSelectSchema = createSelectSchema(settings);
export const settingsUpdateSchema = createUpdateSchema(settings);
