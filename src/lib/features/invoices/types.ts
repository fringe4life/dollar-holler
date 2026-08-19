import type { InferOutput } from "valibot";
import type { CursorId } from "#lib/types.ts";
import type {
  invoiceInsertSchema,
  invoiceListRowSchema,
  invoiceSelectSchema,
  invoiceUpdateSchema,
} from "./schemas.server";

export type InvoiceInsert = InferOutput<typeof invoiceInsertSchema>;
export type InvoiceSelect = InferOutput<typeof invoiceSelectSchema>;
export type InvoiceUpdate = InferOutput<typeof invoiceUpdateSchema>;

// List view: only what InvoiceRow needs (client name + total)
export type InvoiceListResponse = InferOutput<typeof invoiceListRowSchema>;

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
