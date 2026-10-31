import type { InvoiceListResponse } from "../types";
import type { Prettify } from "#lib/types.ts";

export interface ClientInvoiceSummaryInitial {
  draft: number;
  draftCount: number;
  outstanding: number;
  outstandingCount: number;
  overdue: number;
  overdueCount: number;
  paid: number;
  paidCount: number;
}

export type ClientInvoiceSummaryFinal = Prettify<
  ClientInvoiceSummaryInitial & {
    grandTotal: number;
  }
>;

type SummaryInvoice = Pick<
  InvoiceListResponse,
  "dueDate" | "total" | "invoiceStatus"
>;

const isInvoiceOverdue = (dueDate: Date) => dueDate.getTime() < Date.now();

/** Optimistic draft → sent: move invoice total from draft into outstanding or overdue. */
export const applySentInvoiceToSummary = (
  summary: ClientInvoiceSummaryFinal,
  invoice: Pick<SummaryInvoice, "dueDate" | "total">
): ClientInvoiceSummaryFinal => {
  const { total } = invoice;
  const isOverdue = isInvoiceOverdue(invoice.dueDate);
  return {
    draft: summary.draft - total,
    draftCount: summary.draftCount - 1,
    grandTotal: summary.grandTotal,
    outstanding: isOverdue ? summary.outstanding : summary.outstanding + total,
    outstandingCount: isOverdue
      ? summary.outstandingCount
      : summary.outstandingCount + 1,
    overdue: isOverdue ? summary.overdue + total : summary.overdue,
    overdueCount: isOverdue ? summary.overdueCount + 1 : summary.overdueCount,
    paid: summary.paid,
    paidCount: summary.paidCount,
  };
};

/** Optimistic delete: subtract invoice total from its current summary bucket. */
export const applyDeletedInvoiceToSummary = (
  summary: ClientInvoiceSummaryFinal,
  invoice: SummaryInvoice
): ClientInvoiceSummaryFinal => {
  const { total } = invoice;
  const status = invoice.invoiceStatus ?? "draft";
  const isOverdue = isInvoiceOverdue(invoice.dueDate);
  const isDraft = status === "draft";
  const isOutstanding = status === "sent" && !isOverdue;
  const isOverdueBucket = status === "sent" && isOverdue;
  const isPaid = status === "paid";
  return {
    draft: isDraft ? summary.draft - total : summary.draft,
    draftCount: isDraft ? summary.draftCount - 1 : summary.draftCount,
    grandTotal: summary.grandTotal - total,
    outstanding: isOutstanding
      ? summary.outstanding - total
      : summary.outstanding,
    outstandingCount: isOutstanding
      ? summary.outstandingCount - 1
      : summary.outstandingCount,
    overdue: isOverdueBucket ? summary.overdue - total : summary.overdue,
    overdueCount: isOverdueBucket
      ? summary.overdueCount - 1
      : summary.overdueCount,
    paid: isPaid ? summary.paid - total : summary.paid,
    paidCount: isPaid ? summary.paidCount - 1 : summary.paidCount,
  };
};
