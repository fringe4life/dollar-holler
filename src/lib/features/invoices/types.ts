import type { Total } from "$lib/types";
import type {
  invoiceInsertSchema,
  invoiceSelectSchema,
  invoiceUpdateSchema,
} from "$lib/validators";
import type { ClientSelect } from "../clients/types";

export type InvoiceInsert = typeof invoiceInsertSchema.infer;
export type InvoiceSelect = typeof invoiceSelectSchema.infer;
export type InvoiceUpdate = typeof invoiceUpdateSchema.infer;

// List view: only what InvoiceRow needs (client name + total)
export type InvoiceListResponse = InvoiceSelect & {
  client: Pick<ClientSelect, "name">;
} & Total;
