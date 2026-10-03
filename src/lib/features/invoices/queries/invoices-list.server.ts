import { getRequestEvent } from "$app/server";
import { and, eq, like, or, type SQL, sql } from "drizzle-orm";
import {
  rollClientInvoiceSummary,
  type ClientInvoiceTotalRow,
} from "#lib/features/invoices/queries/client-invoice-summary-roll.ts";
import {
  invoiceTotalFromSubtotalSql,
  lineItemsSubtotalSqlForInvoiceId,
  mapRowsWithTotal,
  type RowWithSubtotal,
} from "#lib/features/invoices/queries/invoice-list-helpers.ts";
import type { InvoiceListResponse } from "#features/invoices/types.ts";
import type { ClientInvoiceSummaryFinal } from "#features/invoices/utils/client-invoice-summary.ts";
import type {
  CursorPaginatedList,
  PaginationSearchParams,
} from "#features/pagination/types.ts";
import { withUserAndSearch } from "#features/pagination/utils/base-filter.ts";
import {
  type FetchPageArgs,
  fetchCursorPaginatedList,
} from "#features/pagination/utils/cursor-paginated-fetch.server.ts";
import { db } from "#lib/server/db/index.ts";
import {
  invoices as invoicesTable,
  lineItems as lineItemsTable,
} from "#lib/server/db/schema.ts";
import type { CursorId } from "#lib/schemas/cursor-id.ts";
import type { Maybe } from "#lib/types.ts";

/** Keys allowed in RQB `columns` for `invoices` (matches Drizzle’s `findMany` config). */
type InvoicesQueryColumnSelection = NonNullable<
  NonNullable<Parameters<typeof db.query.invoices.findMany>[0]>["columns"]
>;

/**
 * Substring search. RQB `like` (not `ilike`): SQLite/D1 `LIKE` is ASCII
 * case-insensitive by default — same practical UX as Postgres `ILIKE` for
 * Latin text. See clients-list search note.
 */
const searchWhere = (q: Maybe<string>) => {
  const trimmed = q?.trim();
  if (!trimmed) {
    return;
  }
  const pattern = `%${trimmed}%`;
  return {
    OR: [
      { invoiceNumber: { like: pattern } },
      { subject: { like: pattern } },
      { client: { name: { like: pattern } } },
    ],
  };
};

/** User + client + optional search (same `q` semantics as global invoice list). */
const clientInvoiceListWhere = (
  userId: string,
  clientId: CursorId,
  q: Maybe<string>
) => {
  const sw = searchWhere(q);
  const parts = [
    { userId: { eq: userId } },
    { clientId: { eq: clientId } },
    ...(sw ? [sw] : []),
  ];
  return { AND: parts };
};

/** RQB `columns`: booleans only; keys checked against `InvoicesQueryColumnSelection`. */
const invoiceListColumns = {
  clientId: true,
  createdAt: true,
  discount: true,
  dueDate: true,
  id: true,
  invoiceNumber: true,
  invoiceStatus: true,
  issueDate: true,
  subject: true,
  updatedAt: true,
  userId: true,
} as const satisfies InvoicesQueryColumnSelection;

const mapRows = (
  rows: Array<
    Omit<InvoiceListResponse, "name" | "total"> &
      RowWithSubtotal & {
        client?: { name: string | null } | null;
      }
  >
): InvoiceListResponse[] =>
  mapRowsWithTotal(
    rows.map((row) => {
      const { client, ...rest } = row;
      return {
        ...rest,
        name: client?.name ?? "Unkown",
      };
    })
  );

const invoiceSubtotalExtras = {
  /** Second arg is RQB `{ sql }`; unused — subtotal from `lineItemsSubtotalSqlForInvoiceId`. */
  subtotal: (inv: typeof invoicesTable, _helpers: { sql: typeof sql }) =>
    lineItemsSubtotalSqlForInvoiceId(inv.id),
};

/** Global invoice list: correlated extras kept after #123 discard (1 RTT wins at seed). */
const fetchInvoiceListPage = async ({ where, orderBy, limit }: FetchPageArgs) =>
  await db.query.invoices.findMany({
    columns: invoiceListColumns,
    extras: invoiceSubtotalExtras,
    limit,
    orderBy,
    where,
    with: {
      client: { columns: { name: true } },
    },
  });

/** Client detail list page: no extras — totals from shared CTE (#122). */
const fetchInvoicePageWithoutExtras = async ({
  where,
  orderBy,
  limit,
}: FetchPageArgs) =>
  await db.query.invoices.findMany({
    columns: invoiceListColumns,
    limit,
    orderBy,
    where,
    with: {
      client: { columns: { name: true } },
    },
  });

// biome-ignore lint/suspicious/useAwait: await is not needed for fetchCursorPaginatedList
export const fetchPaginatedInvoices = async (
  userId: string,
  input: PaginationSearchParams
): Promise<CursorPaginatedList<InvoiceListResponse>> => {
  const ws = withUserAndSearch(userId, searchWhere(input.q));
  return fetchCursorPaginatedList({
    baseWhere: ws,
    fetchPage: fetchInvoiceListPage,
    idColumn: invoicesTable.id,
    input,
    map: mapRows,
  });
};

const clientInvoiceSearchFilters = (
  userId: string,
  clientId: CursorId,
  q: Maybe<string>
): SQL[] => {
  const filters: SQL[] = [
    eq(invoicesTable.userId, userId),
    eq(invoicesTable.clientId, clientId),
  ];
  const trimmed = q?.trim();
  if (trimmed) {
    const pattern = `%${trimmed}%`;
    const search = or(
      like(invoicesTable.invoiceNumber, pattern),
      like(invoicesTable.subject, pattern)
    );
    if (search) {
      filters.push(search);
    }
  }
  return filters;
};

/**
 * One pass: SUM(line_items) per invoice for a client (+ optional search).
 * Returns subtotal (list) + SQL ROUND total (summary buckets).
 */
const fetchClientInvoiceTotalRows = async (
  userId: string,
  clientId: CursorId,
  q: Maybe<string>
): Promise<ClientInvoiceTotalRow[]> => {
  const filters = clientInvoiceSearchFilters(userId, clientId, q);

  const invoiceTotals = db.$with("invoice_totals").as(
    db
      .select({
        dueDate: invoicesTable.dueDate,
        id: invoicesTable.id,
        invoiceStatus: invoicesTable.invoiceStatus,
        subtotal: sql<number>`COALESCE(SUM(${lineItemsTable.amount}), 0)`.as(
          "subtotal"
        ),
        total: invoiceTotalFromSubtotalSql(
          sql`SUM(${lineItemsTable.amount})`,
          invoicesTable.discount
        ).as("total"),
      })
      .from(invoicesTable)
      .leftJoin(lineItemsTable, eq(lineItemsTable.invoiceId, invoicesTable.id))
      .where(and(...filters))
      .groupBy(invoicesTable.id)
  );

  const rows = await db
    .with(invoiceTotals)
    .select({
      dueDate: invoiceTotals.dueDate,
      id: invoiceTotals.id,
      invoiceStatus: invoiceTotals.invoiceStatus,
      subtotal: invoiceTotals.subtotal,
      total: invoiceTotals.total,
    })
    .from(invoiceTotals);

  return rows.map((row) => ({
    dueDate: row.dueDate,
    id: row.id,
    invoiceStatus: row.invoiceStatus,
    subtotal: Math.round(Number(row.subtotal ?? 0)),
    total: Math.round(Number(row.total ?? 0)),
  }));
};

type TotalsCache = Map<string, Promise<ClientInvoiceTotalRow[]>>;

const totalsCacheKey = (
  userId: string,
  clientId: CursorId,
  q: Maybe<string>
): string => `${userId}\0${clientId}\0${q?.trim() ?? ""}`;

/**
 * Request-scoped memo so `/clients/[id]` list + summary share one money CTE (#122).
 * Outside a request (scripts/tests): uncached fetch.
 */
const getClientInvoiceTotalRowsCached = (
  userId: string,
  clientId: CursorId,
  q: Maybe<string>
): Promise<ClientInvoiceTotalRow[]> => {
  const key = totalsCacheKey(userId, clientId, q);
  const run = () => fetchClientInvoiceTotalRows(userId, clientId, q);
  try {
    const { locals } = getRequestEvent();
    const bag = locals as App.Locals & {
      clientInvoiceTotalsCache?: TotalsCache;
    };
    const cache = (bag.clientInvoiceTotalsCache ??= new Map());
    let pending = cache.get(key);
    if (!pending) {
      pending = run();
      cache.set(key, pending);
    }
    return pending;
  } catch {
    return run();
  }
};

// biome-ignore lint/suspicious/useAwait: await is not needed for fetchCursorPaginatedList
export const fetchPaginatedInvoicesForClient = async (
  userId: string,
  clientId: CursorId,
  input: PaginationSearchParams
): Promise<CursorPaginatedList<InvoiceListResponse>> => {
  const ws = clientInvoiceListWhere(userId, clientId, input.q);
  // Kick money CTE immediately so summary remote can share (#122).
  const totalsPromise = getClientInvoiceTotalRowsCached(
    userId,
    clientId,
    input.q
  );
  return fetchCursorPaginatedList({
    baseWhere: ws,
    fetchPage: async ({ where, orderBy, limit }) => {
      const [rows, totals] = await Promise.all([
        fetchInvoicePageWithoutExtras({ where, orderBy, limit }),
        totalsPromise,
      ]);
      const subtotalById = new Map(
        totals.map((row) => [row.id, row.subtotal] as const)
      );
      return rows.map((row) => ({
        ...row,
        subtotal: subtotalById.get(row.id) ?? 0,
      }));
    },
    idColumn: invoicesTable.id,
    input,
    map: mapRows,
  });
};

/**
 * Client invoice money buckets (#122).
 * Uses the same request-memoized CTE as `fetchPaginatedInvoicesForClient`.
 */
export const fetchClientInvoiceSummary = async (
  userId: string,
  clientId: CursorId,
  q: Maybe<string>
): Promise<ClientInvoiceSummaryFinal> => {
  const rows = await getClientInvoiceTotalRowsCached(userId, clientId, q);
  return rollClientInvoiceSummary(rows, Date.now());
};
