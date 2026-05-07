/**
 * Invoice list totals (RQB v2 era)
 *
 * Paginated list handlers use `ORDER BY` + `LIMIT` on the parent row (`invoices`
 * or `clients`). Line-item amounts must not multiply rows before `LIMIT`.
 *
 * **Pattern:** `db.query.invoices.findMany` / `db.query.clients.findMany` with
 * `extras` scalar subqueries (`lineItemsSubtotalSqlForInvoiceId` and client
 * financial extras in `clientListHelpers.ts`) — one parent row per invoice or
 * client.
 *
 * Do not join raw `line_items` into paginated lists without collapsing to one
 * row per invoice first.
 *
 * @see ../clients/queries/clientListHelpers.ts for per-client received/balance.
 */

import type { AnyColumn } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { lineItems as lineItemsTable } from "$lib/server/db/schema";
import type { Maybe, Total } from "$lib/types";

/**
 * Scalar subquery: sum of line item amounts for one invoice (for RQB `extras`).
 * Keeps one parent row per invoice (no join explosion).
 */
export const lineItemsSubtotalSqlForInvoiceId = (invoiceId: AnyColumn) =>
  sql<number>`COALESCE((SELECT SUM(${lineItemsTable.amount}) FROM ${lineItemsTable} WHERE ${lineItemsTable.invoiceId} = ${invoiceId}), 0)`;

export interface RowWithSubtotal {
  discount: Maybe<string | number>;
  subtotal: Maybe<string | number>;
}

export const mapRowsWithTotal = <T extends RowWithSubtotal>(
  rows: T[]
): (Omit<T, "subtotal"> & Total)[] =>
  rows.map((row) => {
    const subtotal = Number(row.subtotal ?? 0);
    const discountPercent = Number(row.discount ?? 0);
    const total = Math.round(subtotal - subtotal * (discountPercent / 100));
    const { subtotal: _s, ...rest } = row;
    return { ...rest, total } satisfies Omit<T, "subtotal"> & Total;
  });
