/**
 * List-query join contract (clients list + received/balance aggregates)
 *
 * The clients list is paginated with `ORDER BY` + `LIMIT` on `clients.id`.
 * The join to financial totals must not multiply rows per client.
 *
 * This module MUST keep one SQL row per client at the pagination layer:
 *
 * - `invoiceTotalsSubquery`: one row per invoice (invoices ⋈
 *   `lineItemsTotalSubquery`, which is grouped by `invoiceId` in
 *   invoiceListHelpers).
 * - `clientReceivedBalanceSubquery`: `GROUP BY clientId` over invoice totals,
 *   so at most one row per client before the clients list joins it.
 *
 * Do not:
 * 1. Join raw `line_items` or unaggregated invoice rows into the outer clients
 *    list query.
 * 2. Remove `GROUP BY clientId` from the received/balance subquery without an
 *    equivalent one-row-per-client guarantee.
 * 3. Add M:N joins (e.g. tags) without collapsing to one row per client before
 *    `LIMIT` (see plan §2a: cursor pagination lists).
 *
 * @see ./invoiceListHelpers.ts for `lineItemsTotalSubquery`.
 */
import { db } from "$lib/db";
import { invoices as invoicesTable } from "$lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { lineItemsTotalSubquery } from "../../invoices/queries/invoiceListHelpers";

/**
 * Subquery: per-invoice total (subtotal - discount) with clientId and status.
 * Used to aggregate received (paid) and balance (unpaid) per client.
 */
const invoiceTotalsSubquery = db
  .select({
    clientId: invoicesTable.clientId,
    invoiceStatus: invoicesTable.invoiceStatus,
    subtotal: lineItemsTotalSubquery.subtotal,
    discount: invoicesTable.discount,
  })
  .from(invoicesTable)
  .leftJoin(
    lineItemsTotalSubquery,
    eq(invoicesTable.id, lineItemsTotalSubquery.invoiceId)
  )
  .as("invoice_totals");

/**
 * Subquery: received and balance per client.
 * received = sum of invoice totals where status = 'paid'
 * balance = sum of invoice totals where status != 'paid'
 */
export const clientReceivedBalanceSubquery = db
  .select({
    clientId: invoiceTotalsSubquery.clientId,
    received: sql<number>`COALESCE(SUM(
      CASE WHEN ${invoiceTotalsSubquery.invoiceStatus} = 'paid'
      THEN ROUND(COALESCE(${invoiceTotalsSubquery.subtotal}, 0) - COALESCE(${invoiceTotalsSubquery.subtotal}, 0) * COALESCE(${invoiceTotalsSubquery.discount}, 0) / 100)
      ELSE 0
      END
    ), 0)::bigint`.as("received"),
    balance: sql<number>`COALESCE(SUM(
      CASE WHEN ${invoiceTotalsSubquery.invoiceStatus} IS NULL OR ${invoiceTotalsSubquery.invoiceStatus} != 'paid'
      THEN ROUND(COALESCE(${invoiceTotalsSubquery.subtotal}, 0) - COALESCE(${invoiceTotalsSubquery.subtotal}, 0) * COALESCE(${invoiceTotalsSubquery.discount}, 0) / 100)
      ELSE 0
      END
    ), 0)::bigint`.as("balance"),
  })
  .from(invoiceTotalsSubquery)
  .groupBy(invoiceTotalsSubquery.clientId)
  .as("client_received_balance");
