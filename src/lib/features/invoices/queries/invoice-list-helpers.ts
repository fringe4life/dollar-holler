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
import { lineItems as lineItemsTable } from "#lib/server/db/schema.ts";
import type { Maybe, Total } from "#lib/types.ts";

/**
 * Scalar subquery: sum of line item amounts for one invoice (for RQB `extras`).
 * Keeps one parent row per invoice (no join explosion).
 *
 * `line_items.amount` is the billed line total (qty × unit price, computed in
 * the editor, stored as-is). Do not recompute from qty × unitPrice on read:
 * lists and client summaries hit this SUM on every dashboard load (read-heavy),
 * while Save is rare. Stored amount is also the invoice contract — recalc can
 * penny-drift (`3 × 3.33` vs `10.00`) and qty `0` has no defined unit price.
 *
 * Future (not now): persist `unitPrice`, set `amount = round(qty * unitPrice)`
 * on write so the column stays the source for this SUM. Materialize
 * `invoices.total` only if EXPLAIN shows this subquery hurting. Compute-on-read
 * `SUM(qty * unitPrice)` is fine at current scale, worse for rounding + every
 * list/summary hit.
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
