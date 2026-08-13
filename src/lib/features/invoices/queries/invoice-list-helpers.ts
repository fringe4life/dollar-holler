/**
 * Invoice list totals (RQB v2 era)
 *
 * Paginated list handlers use `ORDER BY` + `LIMIT` on the parent row (`invoices`
 * or `clients`). Line-item amounts must not multiply rows before `LIMIT`.
 *
 * **Pattern:** `db.query.invoices.findMany` / `db.query.clients.findMany` with
 * `extras` scalar subqueries (`lineItemsSubtotalSqlForInvoiceId`) — one parent
 * row per invoice — or batch CTE joins that SUM `line_items` once per invoice
 * (`ROUND(subtotal * (1 - discount/100))`, not two identical SUM subqueries).
 *
 * Do not join raw `line_items` into paginated lists without collapsing to one
 * row per invoice first.
 *
 * @see ../clients/queries/clientListHelpers.ts for per-client received/balance.
 */

import type { AnyColumn, SQL } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { lineItems as lineItemsTable } from "#lib/server/db/schema";
import type { Maybe, Total } from "#lib/types";

/**
 * Scalar subquery: sum of line item amounts for one invoice (for RQB `extras`).
 * Keeps one parent row per invoice (no join explosion).
 */
export const lineItemsSubtotalSqlForInvoiceId = (invoiceId: AnyColumn) =>
  sql<number>`COALESCE((SELECT SUM(${lineItemsTable.amount}) FROM ${lineItemsTable} WHERE ${lineItemsTable.invoiceId} = ${invoiceId}), 0)`;

/**
 * Invoice total from a single subtotal expression + discount % (A: no double SUM).
 * Prefer this over `subtotal - subtotal * discount/100` when both sides would
 * re-run the same correlated `SUM(line_items)`.
 */
export const invoiceTotalFromSubtotalSql = (
  subtotal: SQL | AnyColumn,
  discountPercent: SQL | AnyColumn
) =>
  sql<number>`ROUND(COALESCE(${subtotal}, 0) * (1 - COALESCE(${discountPercent}, 0) / 100))`;

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
    const total = Math.round(subtotal * (1 - discountPercent / 100));
    const { subtotal: _s, ...rest } = row;
    return { ...rest, total } satisfies Omit<T, "subtotal"> & Total;
  });
