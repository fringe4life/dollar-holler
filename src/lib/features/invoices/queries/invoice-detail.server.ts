import { error } from "@sveltejs/kit";
import { db } from "#lib/server/db";
import type { CursorId } from "#lib/types";
import type { ClientSelect } from "#features/clients/types";
import type { LineItemEditRow } from "#features/line-items/types";
import type { InvoiceSelect } from "../types";

export const fetchInvoiceDetail = async (
  userId: string,
  id: CursorId
): Promise<{
  client: ClientSelect | null;
  invoice: InvoiceSelect;
  lineItems: LineItemEditRow[];
}> => {
  const invoiceRow = await db.query.invoices.findFirst({
    where: { id: { eq: id }, userId: { eq: userId } },
  });
  if (!invoiceRow) {
    error(404, "Invoice not found");
  }
  const { userId: _invoiceUserId, ...invoice } = invoiceRow;

  const [clientRow, lineItems] = await Promise.all([
    db.query.clients.findFirst({
      where: {
        id: { eq: invoice.clientId },
        userId: { eq: userId },
      },
    }),
    db.query.lineItems.findMany({
      columns: {
        amount: true,
        description: true,
        id: true,
        quantity: true,
      },
      where: {
        invoiceId: { eq: invoice.id },
        userId: { eq: userId },
      },
    }),
  ]);

  const client = clientRow
    ? (() => {
        const { userId: _clientUserId, ...rest } = clientRow;
        return rest;
      })()
    : null;

  return { client, invoice, lineItems };
};
