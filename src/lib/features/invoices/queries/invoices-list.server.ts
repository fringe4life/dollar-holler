import type { sql } from "drizzle-orm";
import {
  lineItemsSubtotalSqlForInvoiceId,
  mapRowsWithTotal,
  type RowWithSubtotal,
} from "$features/invoices/queries/invoiceListHelpers";
import type { InvoiceListResponse } from "$features/invoices/types";
import {
  aggregateClientInvoiceBuckets,
  type ClientInvoiceSummaryCents,
} from "$features/invoices/utils/client-invoice-summary";
import type {
  CursorPaginatedList,
  PaginationSearchParams,
} from "$features/pagination/types";
import { withUserAndSearch } from "$features/pagination/utils/base-filter";
import {
  type FetchPageArgs,
  fetchCursorPaginatedList,
} from "$features/pagination/utils/cursor-paginated-fetch.server";
import { db } from "$lib/server/db";
import { invoices as invoicesTable } from "$lib/server/db/schema";
import type { CursorId, Maybe } from "$lib/types";

/** Keys allowed in RQB `columns` for `invoices` (matches Drizzle’s `findMany` config). */
type InvoicesQueryColumnSelection = NonNullable<
  NonNullable<Parameters<typeof db.query.invoices.findMany>[0]>["columns"]
>;

const searchWhere = (q: Maybe<string>) => {
  const trimmed = q?.trim();
  if (!trimmed) {
    return;
  }
  const pattern = `%${trimmed}%`;
  return {
    OR: [
      { invoiceNumber: { ilike: pattern } },
      { subject: { ilike: pattern } },
      /** Enum `invoice_status` cannot use ILIKE in Postgres without a cast; RQB maps `ilike` to `~~*` on the enum and errors. */
      { client: { name: { ilike: pattern } } },
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

const invoiceSubtotalExtras = {
  /** Second arg is RQB `{ sql }`; unused — subtotal comes from `lineItemsSubtotalSqlForInvoiceId`. */
  subtotal: (inv: typeof invoicesTable, _helpers: { sql: typeof sql }) =>
    lineItemsSubtotalSqlForInvoiceId(inv.id),
};

/** RQB `columns`: booleans only; keys checked against `InvoicesQueryColumnSelection`. */
const invoiceListColumns = {
  id: true,
  userId: true,
  invoiceNumber: true,
  clientId: true,
  subject: true,
  issueDate: true,
  dueDate: true,
  discount: true,
  invoiceStatus: true,
  createdAt: true,
  updatedAt: true,
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

const fetchInvoiceListPage = async ({ where, orderBy, limit }: FetchPageArgs) =>
  await db.query.invoices.findMany({
    where,
    columns: invoiceListColumns,
    with: {
      client: { columns: { name: true } },
    },
    extras: invoiceSubtotalExtras,
    orderBy,
    limit,
  });

// biome-ignore lint/suspicious/useAwait: await is not needed for fetchCursorPaginatedList
export const fetchPaginatedInvoices = async (
  userId: string,
  input: PaginationSearchParams
): Promise<CursorPaginatedList<InvoiceListResponse>> => {
  const ws = withUserAndSearch(userId, searchWhere(input.q));
  return fetchCursorPaginatedList({
    input,
    baseWhere: ws,
    idColumn: invoicesTable.id,
    map: mapRows,
    fetchPage: fetchInvoiceListPage,
  });
};

// biome-ignore lint/suspicious/useAwait: await is not needed for fetchCursorPaginatedList
export const fetchPaginatedInvoicesForClient = async (
  userId: string,
  clientId: CursorId,
  input: PaginationSearchParams
): Promise<CursorPaginatedList<InvoiceListResponse>> => {
  const ws = clientInvoiceListWhere(userId, clientId, input.q);
  return fetchCursorPaginatedList({
    input,
    baseWhere: ws,
    idColumn: invoicesTable.id,
    map: mapRows,
    fetchPage: fetchInvoiceListPage,
  });
};

export const fetchClientInvoiceSummary = async (
  userId: string,
  clientId: CursorId,
  q: Maybe<string>
): Promise<ClientInvoiceSummaryCents> => {
  const where = clientInvoiceListWhere(userId, clientId, q);
  const raw = await db.query.invoices.findMany({
    where,
    columns: {
      dueDate: true,
      discount: true,
      invoiceStatus: true,
    },
    extras: invoiceSubtotalExtras,
    orderBy: { id: "asc" },
  });

  const withTotal = mapRowsWithTotal(raw);
  return aggregateClientInvoiceBuckets(
    withTotal.map((row) => ({
      total: row.total,
      invoiceStatus: row.invoiceStatus,
      dueDate: row.dueDate,
    }))
  );
};
