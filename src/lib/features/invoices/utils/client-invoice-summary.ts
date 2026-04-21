import { isLate } from "$lib/utils/dateHelpers";

export interface ClientInvoiceSummaryCents {
  overdue: number;
  outstanding: number;
  draft: number;
  paid: number;
  grandTotal: number;
}

/** Rows must include computed `total` (cents), status, and due date for overdue vs outstanding. */
export const aggregateClientInvoiceBuckets = (
  rows: readonly {
    total: number;
    invoiceStatus: string | null;
    dueDate: Date;
  }[]
): ClientInvoiceSummaryCents => {
  let overdue = 0;
  let outstanding = 0;
  let draft = 0;
  let paid = 0;

  for (const i of rows) {
    const amount = i.total ?? 0;
    if (i.invoiceStatus === "draft") {
      draft += amount;
    } else if (i.invoiceStatus === "paid") {
      paid += amount;
    } else if (i.invoiceStatus === "sent") {
      if (isLate(i.dueDate.toISOString())) {
        overdue += amount;
      } else {
        outstanding += amount;
      }
    }
  }

  const grandTotal = overdue + outstanding + draft + paid;
  return { overdue, outstanding, draft, paid, grandTotal };
};
