import { error } from "@sveltejs/kit";
import { db } from "#lib/server/db/index.ts";
import type { CursorId } from "#lib/schemas/cursor-id.ts";
import type { ClientSelect } from "#features/clients/types.ts";
import type { LineItemEditRow } from "#features/line-items/types.ts";
import type { InvoiceSelect } from "../types";

type InvoiceDetail = {
  client: ClientSelect | null;
  invoice: InvoiceSelect;
  lineItems: LineItemEditRow[];
};

/**
 * Invoice + client + line items in one RQB statement (Drizzle emits 1 SQL).
 *
 * RTT before (#121):
 * - Detail page: 3 (invoice, then parallel client + lineItems)
 * - Editor open: 3 (getInvoice + verifyInvoice + listLineItems)
 *
 * RTT after: 1 for both paths (`getInvoiceDetail` / this helper).
 * Ownership: `userId` on invoice WHERE; nested client/lineItems also scoped.
 */
export const fetchInvoiceDetail = async (
  userId: string,
  id: CursorId
): Promise<InvoiceDetail> => {
  const row = await db.query.invoices.findFirst({
    columns: { userId: false },
    where: { id: { eq: id }, userId: { eq: userId } },
    with: {
      client: {
        columns: { userId: false },
        where: { userId: { eq: userId } },
      },
      lineItems: {
        columns: {
          amount: true,
          description: true,
          id: true,
          quantity: true,
        },
        where: { userId: { eq: userId } },
      },
    },
  });
  if (!row) {
    error(404, "Invoice not found");
  }

  const { client, lineItems, ...invoice } = row;
  return {
    client: client ?? null,
    invoice,
    lineItems,
  };
};
