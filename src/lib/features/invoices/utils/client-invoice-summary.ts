import type { InvoiceListResponse } from "../types";

export interface ClientInvoiceSummaryCents {
  draft: number;
  grandTotal: number;
  outstanding: number;
  overdue: number;
  paid: number;
}

// interface SummaryInvoice {
//   dueDate: Date;
//   invoiceStatus?: "draft" | "paid" | "sent" | null;
//   total: number;
// }

type SummaryInvoice = Pick<
  InvoiceListResponse,
  "dueDate" | "total" | "invoiceStatus"
>;

const isInvoiceOverdue = (dueDate: Date) => dueDate.getTime() < Date.now();

/** Optimistic draft → sent: move invoice total from draft into outstanding or overdue. */
export const applySentInvoiceToSummary = (
  summary: ClientInvoiceSummaryCents,
  invoice: Pick<SummaryInvoice, "dueDate" | "total">
): ClientInvoiceSummaryCents => {
  const { total } = invoice;
  const isOverdue = isInvoiceOverdue(invoice.dueDate);
  return {
    draft: summary.draft - total,
    grandTotal: summary.grandTotal,
    outstanding: isOverdue ? summary.outstanding : summary.outstanding + total,
    overdue: isOverdue ? summary.overdue + total : summary.overdue,
    paid: summary.paid,
  };
};

/** Optimistic delete: subtract invoice total from its current summary bucket. */
export const applyDeletedInvoiceToSummary = (
  summary: ClientInvoiceSummaryCents,
  invoice: SummaryInvoice
): ClientInvoiceSummaryCents => {
  const { total } = invoice;
  const status = invoice.invoiceStatus ?? "draft";
  const isOverdue = isInvoiceOverdue(invoice.dueDate);
  return {
    draft: status === "draft" ? summary.draft - total : summary.draft,
    grandTotal: summary.grandTotal - total,
    outstanding:
      status === "sent" && !isOverdue
        ? summary.outstanding - total
        : summary.outstanding,
    overdue:
      status === "sent" && isOverdue
        ? summary.overdue - total
        : summary.overdue,
    paid: status === "paid" ? summary.paid - total : summary.paid,
  };
};
