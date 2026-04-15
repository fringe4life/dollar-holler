import type { CursorId } from "$lib/types";
import type {
  invoiceInsertSchema,
  invoiceSelectSchema,
  invoiceUpdateSchema,
} from "$lib/validators";
import type { invoiceListRowSchema } from "./schemas";

export type InvoiceInsert = typeof invoiceInsertSchema.infer;
export type InvoiceSelect = typeof invoiceSelectSchema.infer;
export type InvoiceUpdate = typeof invoiceUpdateSchema.infer;

// List view: only what InvoiceRow needs (client name + total)
export type InvoiceListResponse = typeof invoiceListRowSchema.infer;

export type NewInvoice = Omit<
  InvoiceInsert,
  "clientId" | "issueDate" | "dueDate" | "discount"
> & {
  clientId: CursorId | undefined;
  issueDate: string;
  dueDate: string;
  discount: number;
};

export type InvoiceDeleteConfirmItem = Pick<
  InvoiceListResponse,
  "id" | "name" | "total"
>;
