/**
 * List-query contract (clients list + received/balance aggregates)
 *
 * Paginated list handlers use `ORDER BY` + `LIMIT` on `clients.id`.
 * Financial totals are loaded in a **second batch query** for the page’s client
 * ids (CTE: one `SUM(line_items)` per invoice, then paid/unpaid rolls).
 *
 * Do not join raw `line_items` or unaggregated invoice rows into the outer
 * clients list query in a way that multiplies rows per client.
 *
 * ## Money typing (SQLite / D1)
 *
 * `line_items.amount` and `invoices.discount` are `real`, so `SUM` / `ROUND` here
 * typically yield a floating value from D1. List mapper coerces with
 * `Math.round(Number(...))` so API / UI always see integer **cents** as `number`.
 *
 * Long term: store money as integer cents in the schema (`integer` columns, no
 * `real`), compute discounts in integer math, and drop the JS `Number`/`round`
 * band-aid.
 *
 * @see ../../invoices/queries/invoiceListHelpers.ts for single-SUM total algebra.
 */

import { and, eq, inArray, sql } from "drizzle-orm";
import { invoiceTotalFromSubtotalSql } from "#features/invoices/queries/invoice-list-helpers.ts";
import type { AppDatabase } from "#lib/server/db/create-db.ts";
import { getDb } from "#lib/server/db/index.ts";
import {
  invoices as invoicesTable,
  lineItems as lineItemsTable,
} from "#lib/server/db/schema.ts";
import type { CursorId } from "#lib/schemas/cursor-id.ts";

interface ClientReceivedBalance {
  balance: number;
  received: number;
}

const emptyMoney = (): ClientReceivedBalance => ({ balance: 0, received: 0 });

/**
 * Stable `IN` shape for prepare: page size must not change placeholder count.
 * SQLite/D1 `json_each` expands one JSON-array text param into values.
 */
const clientIdsInJsonEach = inArray(
  invoicesTable.clientId,
  sql`(SELECT value FROM json_each(${sql.placeholder("clientIdsJson")}))`
);

/**
 * Prepared money CTE: `userId` + `clientIdsJson` (JSON array of ids).
 * Prefer this over `inArray([...ids])`, which changes `?` count with page size.
 */
const prepareClientReceivedBalance = (database: AppDatabase) => {
  const invoiceTotals = database.$with("invoice_totals").as(
    database
      .select({
        clientId: invoicesTable.clientId,
        id: invoicesTable.id,
        invoiceStatus: invoicesTable.invoiceStatus,
        total: invoiceTotalFromSubtotalSql(
          sql`SUM(${lineItemsTable.amount})`,
          invoicesTable.discount
        ).as("total"),
      })
      .from(invoicesTable)
      .leftJoin(lineItemsTable, eq(lineItemsTable.invoiceId, invoicesTable.id))
      .where(
        and(
          eq(invoicesTable.userId, sql.placeholder("userId")),
          clientIdsInJsonEach
        )
      )
      .groupBy(invoicesTable.id)
  );

  return database
    .with(invoiceTotals)
    .select({
      balance:
        sql<number>`COALESCE(SUM(CASE WHEN ${invoiceTotals.invoiceStatus} IS NULL OR ${invoiceTotals.invoiceStatus} <> 'paid' THEN ${invoiceTotals.total} ELSE 0 END), 0)`.as(
          "balance"
        ),
      clientId: invoiceTotals.clientId,
      received:
        sql<number>`COALESCE(SUM(CASE WHEN ${invoiceTotals.invoiceStatus} = 'paid' THEN ${invoiceTotals.total} ELSE 0 END), 0)`.as(
          "received"
        ),
    })
    .from(invoiceTotals)
    .groupBy(invoiceTotals.clientId)
    .prepare();
};

const clientReceivedBalancePreparedByDb = new WeakMap<
  AppDatabase,
  ReturnType<typeof prepareClientReceivedBalance>
>();

const getClientReceivedBalancePrepared = (database: AppDatabase) => {
  const cached = clientReceivedBalancePreparedByDb.get(database);
  if (cached) {
    return cached;
  }
  const prepared = prepareClientReceivedBalance(database);
  clientReceivedBalancePreparedByDb.set(database, prepared);
  return prepared;
};

/**
 * One pass over invoices + line_items for the given client ids.
 * Invoice total = `ROUND(SUM(amount) * (1 - discount/100))` (single SUM).
 * Then roll into received (paid) vs balance (not paid).
 * Tenant-scoped via `userId` (defense-in-depth; matches other invoice queries).
 */
export const fetchClientReceivedBalanceForIds = async (
  userId: string,
  clientIds: readonly CursorId[]
): Promise<Map<CursorId, ClientReceivedBalance>> => {
  const result = new Map<CursorId, ClientReceivedBalance>();
  for (const id of clientIds) {
    result.set(id, emptyMoney());
  }
  if (clientIds.length === 0) {
    return result;
  }

  const rows = await getClientReceivedBalancePrepared(getDb()).all({
    clientIdsJson: JSON.stringify(clientIds),
    userId,
  });

  for (const row of rows) {
    result.set(row.clientId, {
      balance: Math.round(Number(row.balance ?? 0)),
      received: Math.round(Number(row.received ?? 0)),
    });
  }

  return result;
};
