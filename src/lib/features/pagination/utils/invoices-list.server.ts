import { db } from "$lib/db";
import {
  clients as clientsTable,
  invoices as invoicesTable,
} from "$lib/db/schema";
import {
  lineItemsTotalSubquery,
  mapRowsWithTotal,
} from "$lib/features/invoices/queries/invoiceListHelpers";
import type { InvoiceListResponse } from "$lib/features/invoices/types";
import type { CursorPaginatedList } from "$lib/features/pagination/types";
import { and, eq, ilike, or } from "drizzle-orm";
import type { PaginationSearchParams } from "../types";
import { resolveCursorListQuery } from "./cursor-list-query.server";
import { toPagination } from "./to-pagination.server";

const searchWhere = (q: string | undefined) => {
  if (!q?.trim()) {
    return undefined;
  }
  const t = q.trim();
  return or(
    ilike(invoicesTable.invoiceNumber, `%${t}%`),
    ilike(invoicesTable.subject, `%${t}%`),
    ilike(invoicesTable.invoiceStatus, `%${t}%`),
    ilike(clientsTable.name, `%${t}%`)
  );
};

const baseFilter = (userId: string, q: string | undefined) => {
  const baseWhere = eq(invoicesTable.userId, userId);
  const sw = searchWhere(q);
  return sw ? and(baseWhere, sw) : baseWhere;
};

const mapToInvoiceList = (
  withTotal: ReturnType<typeof mapRowsWithTotal>
): InvoiceListResponse[] => {
  return withTotal.map((row) => {
    const { clientName, ...rest } = row as typeof row & {
      clientName: string | null;
    };
    return {
      ...rest,
      client: { name: clientName ?? "Unknown" },
    } as InvoiceListResponse;
  });
};

export const fetchPaginatedInvoices = async (
  userId: string,
  input: PaginationSearchParams
): Promise<CursorPaginatedList<InvoiceListResponse>> => {
  const { q, cursor, direction, limit } = input;
  const ws = baseFilter(userId, q);
  const take = limit + 1;

  const plan = resolveCursorListQuery(ws, cursor, direction, invoicesTable.id);
  if (plan.kind === "first-page") {
    return fetchPaginatedInvoices(userId, {
      ...input,
      direction: "forward",
      cursor: undefined,
    });
  }

  const raw = await db
    .select({
      id: invoicesTable.id,
      userId: invoicesTable.userId,
      invoiceNumber: invoicesTable.invoiceNumber,
      clientId: invoicesTable.clientId,
      subject: invoicesTable.subject,
      issueDate: invoicesTable.issueDate,
      dueDate: invoicesTable.dueDate,
      discount: invoicesTable.discount,
      notes: invoicesTable.notes,
      terms: invoicesTable.terms,
      invoiceStatus: invoicesTable.invoiceStatus,
      createdAt: invoicesTable.createdAt,
      updatedAt: invoicesTable.updatedAt,
      clientName: clientsTable.name,
      subtotal: lineItemsTotalSubquery.subtotal,
    })
    .from(invoicesTable)
    .leftJoin(clientsTable, eq(invoicesTable.clientId, clientsTable.id))
    .leftJoin(
      lineItemsTotalSubquery,
      eq(invoicesTable.id, lineItemsTotalSubquery.invoiceId)
    )
    .where(plan.where)
    .orderBy(plan.orderBy)
    .limit(take);

  return toPagination({
    rows: raw,
    limit,
    cursor,
    direction: plan.direction,
    map: (rows) => mapToInvoiceList(mapRowsWithTotal(rows)),
  });
};
