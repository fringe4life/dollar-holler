import type { CursorId, Total } from "$lib/types";
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
export type InvoiceListResponse = InvoiceSelect &
  Pick<ClientSelect, "name"> &
  Total;

export type NewInvoice = Omit<
  InvoiceInsert,
  "clientId" | "updatedAt" | "createdAt" | "issueDate" | "dueDate"
> & {
  clientId: CursorId | undefined;
  issueDate: string;
  dueDate: string;
};
