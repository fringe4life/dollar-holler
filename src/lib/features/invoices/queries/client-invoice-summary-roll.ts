import type {
  ClientInvoiceSummaryFinal,
  ClientInvoiceSummaryInitial,
} from "#features/invoices/utils/client-invoice-summary.ts";
import type { CursorId } from "#lib/schemas/cursor-id.ts";

/** Per-invoice money row from the client-scoped CTE (#122). */
export type ClientInvoiceTotalRow = {
  dueDate: Date;
  id: CursorId;
  invoiceStatus: string | null;
  subtotal: number;
  total: number;
};

const handleSummary = (invoice?: number) => Math.round(Number(invoice ?? 0));

const createSummary = (
  row: Partial<ClientInvoiceSummaryInitial>
): ClientInvoiceSummaryFinal => {
  const draft = handleSummary(row.draft);
  const outstanding = handleSummary(row.outstanding);
  const overdue = handleSummary(row.overdue);
  const paid = handleSummary(row.paid);
  return {
    draft,
    draftCount: row.draftCount ?? 0,
    grandTotal: draft + outstanding + overdue + paid,
    outstanding,
    outstandingCount: row.outstandingCount ?? 0,
    overdue,
    overdueCount: row.overdueCount ?? 0,
    paid,
    paidCount: row.paidCount ?? 0,
  };
};

/**
 * Roll CTE invoice totals into draft / outstanding / overdue / paid.
 * `dueDate >= nowMs` → outstanding (matches SQL CASE in prior CTE summary).
 */
export const rollClientInvoiceSummary = (
  rows: readonly ClientInvoiceTotalRow[],
  nowMs: number
): ClientInvoiceSummaryFinal => {
  let draft = 0;
  let draftCount = 0;
  let outstanding = 0;
  let outstandingCount = 0;
  let overdue = 0;
  let overdueCount = 0;
  let paid = 0;
  let paidCount = 0;
  for (const row of rows) {
    const total = row.total;
    const status = row.invoiceStatus;
    if (status === "draft") {
      draft += total;
      draftCount += 1;
    } else if (status === "paid") {
      paid += total;
      paidCount += 1;
    } else if (status === "sent") {
      const dueMs =
        row.dueDate instanceof Date
          ? row.dueDate.getTime()
          : Number(row.dueDate);
      if (dueMs >= nowMs) {
        outstanding += total;
        outstandingCount += 1;
      } else {
        overdue += total;
        overdueCount += 1;
      }
    }
  }
  return createSummary({
    draft,
    draftCount,
    outstanding,
    outstandingCount,
    overdue,
    overdueCount,
    paid,
    paidCount,
  });
};
