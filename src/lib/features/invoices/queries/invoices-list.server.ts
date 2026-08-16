import { and, eq, like, or, type SQL, sql } from "drizzle-orm";
import {
  invoiceTotalFromSubtotalSql,
  lineItemsSubtotalSqlForInvoiceId,
  mapRowsWithTotal,
  type RowWithSubtotal,
} from "#lib/features/invoices/queries/invoice-list-helpers.ts";
import type { InvoiceListResponse } from "#features/invoices/types.ts";
import type {
  ClientInvoiceSummaryFinal,
  ClientInvoiceSummaryInitial,
} from "#features/invoices/utils/client-invoice-summary.ts";
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
import type { CursorId, Maybe } from "#lib/types.ts";

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

const invoiceSubtotalExtras = {
  /** Second arg is RQB `{ sql }`; unused — subtotal comes from `lineItemsSubtotalSqlForInvoiceId`. */
  subtotal: (inv: typeof invoicesTable, _helpers: { sql: typeof sql }) =>
    lineItemsSubtotalSqlForInvoiceId(inv.id),
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

// biome-ignore lint/suspicious/useAwait: await is not needed for fetchCursorPaginatedList
export const fetchPaginatedInvoicesForClient = async (
  userId: string,
  clientId: CursorId,
  input: PaginationSearchParams
): Promise<CursorPaginatedList<InvoiceListResponse>> => {
  const ws = clientInvoiceListWhere(userId, clientId, input.q);
  return fetchCursorPaginatedList({
    baseWhere: ws,
    fetchPage: fetchInvoiceListPage,
    idColumn: invoicesTable.id,
    input,
    map: mapRows,
  });
};

/**
 * Client invoice money buckets in one SQL round-trip (B).
 * Inner CTE: one `SUM(line_items)` per invoice + discount algebra (A).
 * Outer: CASE/SUM into draft / paid / overdue / outstanding.
 * Search `q` matches invoice number/subject only (client already scoped).
 */
export const fetchClientInvoiceSummary = async (
  userId: string,
  clientId: CursorId,
  q: Maybe<string>
): Promise<ClientInvoiceSummaryFinal> => {
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

  const nowMs = Date.now();
  const invoiceTotals = db.$with("invoice_totals").as(
    db
      .select({
        dueDate: invoicesTable.dueDate,
        id: invoicesTable.id,
        invoiceStatus: invoicesTable.invoiceStatus,
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

  const [row] = await db
    .with(invoiceTotals)
    .select({
      draft:
        sql<number>`COALESCE(SUM(CASE WHEN ${invoiceTotals.invoiceStatus} = 'draft' THEN ${invoiceTotals.total} ELSE 0 END), 0)`.as(
          "draft"
        ),
      outstanding:
        sql<number>`COALESCE(SUM(CASE WHEN ${invoiceTotals.invoiceStatus} = 'sent' AND ${invoiceTotals.dueDate} >= ${nowMs} THEN ${invoiceTotals.total} ELSE 0 END), 0)`.as(
          "outstanding"
        ),
      overdue:
        sql<number>`COALESCE(SUM(CASE WHEN ${invoiceTotals.invoiceStatus} = 'sent' AND ${invoiceTotals.dueDate} < ${nowMs} THEN ${invoiceTotals.total} ELSE 0 END), 0)`.as(
          "overdue"
        ),
      paid: sql<number>`COALESCE(SUM(CASE WHEN ${invoiceTotals.invoiceStatus} = 'paid' THEN ${invoiceTotals.total} ELSE 0 END), 0)`.as(
        "paid"
      ),
    })
    .from(invoiceTotals);

  return createSummary(row);
};

const createSummary = (
  row: Partial<ClientInvoiceSummaryInitial>
): ClientInvoiceSummaryFinal => {
  const calculateDraft = handleSummary(row.draft);
  const calculateOutstanding = handleSummary(row.outstanding);
  const calculateOverdue = handleSummary(row.overdue);
  const calculatePaid = handleSummary(row.paid);
  const calculateGrandTotal =
    calculateDraft + calculateOutstanding + calculateOverdue + calculatePaid;
  return {
    draft: calculateDraft,
    grandTotal: calculateGrandTotal,
    outstanding: calculateOutstanding,
    overdue: calculateOverdue,
    paid: calculatePaid,
  };
};

const handleSummary = (invoice?: number) => Math.round(Number(invoice ?? 0));
