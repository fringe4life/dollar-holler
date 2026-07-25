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
 * ## Money typing (SQLite / Turso)
 *
 * `line_items.amount` and `invoices.discount` are `real`, so `SUM` / `ROUND` here
 * typically yield a floating value from libSQL (Postgres used to coerce with
 * `::bigint`). That is fine: `fetchPaginatedClients` normalizes with
 * `Math.round(Number(...))` so API / UI always see integer **cents** as `number`
 * (see `ClientListResponse`, `centsToDollars`).
 *
 * Long term: store money as integer cents in the schema (`integer` columns, no
 * `real`), compute discounts in integer math, and drop the JS `Number`/`round`
 * band-aid. Until then, keep SQL `ROUND` + the list `mapRows` coercion as the
 * contract — do not reintroduce dialect-only casts (`::bigint`).
 *
 * @see ../../invoices/queries/invoiceListHelpers.ts for `lineItemsSubtotalSqlForInvoiceId`.
 */

import type { sql } from "drizzle-orm";
import type { clients as clientsTable } from "$lib/server/db/schema";

/**
 * RQB `extras`: received (paid) and balance (unpaid) per client, matching the
 * previous `GROUP BY clientId` CASE/SUM semantics over per-invoice totals.
 * Driver may return float/string; list mapper coerces to integer cents.
 */
export const clientReceivedBalanceExtras = {
  balance: (clients: typeof clientsTable, { sql: sq }: { sql: typeof sql }) =>
    sq<number>`(
      SELECT COALESCE(SUM(
        CASE WHEN i.invoice_status IS NULL OR i.invoice_status <> 'paid'
        THEN ROUND(
          COALESCE((SELECT SUM(li.amount) FROM line_items li WHERE li.invoice_id = i.id), 0)
          - COALESCE((SELECT SUM(li.amount) FROM line_items li WHERE li.invoice_id = i.id), 0) * COALESCE(i.discount, 0) / 100
        )
        ELSE 0 END
      ), 0)
      FROM invoices i
      WHERE i.client_id = ${clients.id}
    )`,
  received: (clients: typeof clientsTable, { sql: sq }: { sql: typeof sql }) =>
    sq<number>`(
      SELECT COALESCE(SUM(
        CASE WHEN i.invoice_status = 'paid'
        THEN ROUND(
          COALESCE((SELECT SUM(li.amount) FROM line_items li WHERE li.invoice_id = i.id), 0)
          - COALESCE((SELECT SUM(li.amount) FROM line_items li WHERE li.invoice_id = i.id), 0) * COALESCE(i.discount, 0) / 100
        )
        ELSE 0 END
      ), 0)
      FROM invoices i
      WHERE i.client_id = ${clients.id}
    )`,
};
