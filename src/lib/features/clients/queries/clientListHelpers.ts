/**
 * List-query contract (clients list + received/balance aggregates)
 *
 * Paginated list handlers use `ORDER BY` + `LIMIT` on `clients.id`.
 * Financial totals are **scalar correlated subqueries** in RQB `extras` so there
 * is at most one SQL row per client before `LIMIT`.
 *
 * Do not join raw `line_items` or unaggregated invoice rows into the outer
 * clients list query in a way that multiplies rows per client.
 *
 * @see ../../invoices/queries/invoiceListHelpers.ts for `lineItemsSubtotalSqlForInvoiceId`.
 */
import { clients as clientsTable } from "$lib/server/db/schema";
import { sql } from "drizzle-orm";

/**
 * RQB `extras`: received (paid) and balance (unpaid) per client, matching the
 * previous `GROUP BY clientId` CASE/SUM semantics over per-invoice totals.
 */
export const clientReceivedBalanceExtras = {
  received: (clients: typeof clientsTable, { sql: sq }: { sql: typeof sql }) =>
    sq<number>`(
      SELECT COALESCE(SUM(
        CASE WHEN i.invoice_status = 'paid'
        THEN ROUND(
          COALESCE((SELECT SUM(li.amount) FROM line_items li WHERE li.invoice_id = i.id), 0)
          - COALESCE((SELECT SUM(li.amount) FROM line_items li WHERE li.invoice_id = i.id), 0) * COALESCE(i.discount, 0) / 100
        )
        ELSE 0 END
      ), 0)::bigint
      FROM invoices i
      WHERE i.client_id = ${clients.id}
    )`,
  balance: (clients: typeof clientsTable, { sql: sq }: { sql: typeof sql }) =>
    sq<number>`(
      SELECT COALESCE(SUM(
        CASE WHEN i.invoice_status IS NULL OR i.invoice_status <> 'paid'
        THEN ROUND(
          COALESCE((SELECT SUM(li.amount) FROM line_items li WHERE li.invoice_id = i.id), 0)
          - COALESCE((SELECT SUM(li.amount) FROM line_items li WHERE li.invoice_id = i.id), 0) * COALESCE(i.discount, 0) / 100
        )
        ELSE 0 END
      ), 0)::bigint
      FROM invoices i
      WHERE i.client_id = ${clients.id}
    )`,
};
