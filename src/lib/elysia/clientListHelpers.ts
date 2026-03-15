import { db } from "$lib/db";
import { invoices as invoicesTable } from "$lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { lineItemsTotalSubquery } from "./invoiceListHelpers";

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
