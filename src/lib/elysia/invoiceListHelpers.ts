/**
 * List-query join contract (invoices + any route that joins invoice totals)
 *
 * Paginated list handlers use `ORDER BY` + `LIMIT` on the SQL result. If joins
 * multiply rows (e.g. raw `line_items` without aggregation), keyset pagination
 * paginates SQL rows, not invoices — duplicates or skipped rows across pages.
 *
 * This module MUST keep one SQL row per invoice at the pagination layer:
 *
 * - `lineItemsTotalSubquery` aggregates with `GROUP BY invoiceId` before join
 *   to `invoices`, so the subquery has at most one row per invoice.
 *
 * Do not:
 * 1. Join `line_items` directly in a paginated invoice list query.
 * 2. Remove `GROUP BY invoiceId` here without another one-row-per-invoice
 *    pattern (e.g. scalar subselect, DISTINCT ON).
 * 3. Add 1:N or M:N joins in list queries without collapsing to one row per
 *    invoice before `LIMIT` (see plan §2a: cursor pagination lists).
 *
 * @see ./clientListHelpers.ts for the client-list aggregate chain.
 */
import { db } from "$lib/db";
import { lineItems as lineItemsTable } from "$lib/db/schema";
import type { Maybe } from "$lib/types";
import type { Total } from "$lib/validators";
import { sum } from "drizzle-orm";

export const lineItemsTotalSubquery = db
  .select({
    invoiceId: lineItemsTable.invoiceId,
    subtotal: sum(lineItemsTable.amount).as("subtotal"),
  })
  .from(lineItemsTable)
  .groupBy(lineItemsTable.invoiceId)
  .as("line_items_total");

type RowWithSubtotal = {
  subtotal: Maybe<string | number>;
  discount: Maybe<string | number>;
};

export function mapRowsWithTotal<T extends RowWithSubtotal>(
  rows: T[]
): (Omit<T, "subtotal"> & Total)[] {
  return rows.map((row) => {
    const subtotal = Number(row.subtotal ?? 0);
    const discountPercent = Number(row.discount ?? 0);
    const total = Math.round(subtotal - subtotal * (discountPercent / 100));
    const { subtotal: _s, ...rest } = row;
    return { ...rest, total } satisfies Omit<T, "subtotal"> & Total;
  });
}
