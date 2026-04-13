import { db } from "$lib/db";
import { clients as clientsTable } from "$lib/db/schema";
import { clientReceivedBalanceSubquery } from "$lib/features/clients/queries/clientListHelpers";
import type {
  ClientListResponse,
  ClientSelect,
} from "$lib/features/clients/types";
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
    ilike(clientsTable.name, `%${t}%`),
    ilike(clientsTable.email, `%${t}%`),
    ilike(clientsTable.street, `%${t}%`),
    ilike(clientsTable.city, `%${t}%`),
    ilike(clientsTable.state, `%${t}%`),
    ilike(clientsTable.zip, `%${t}%`),
    ilike(clientsTable.clientStatus, `%${t}%`)
  );
};

const baseFilter = (userId: string, q: string | undefined) => {
  const baseWhere = eq(clientsTable.userId, userId);
  const sw = searchWhere(q);
  return sw ? and(baseWhere, sw) : baseWhere;
};

const mapRows = (
  rows: Array<ClientSelect & { received: number; balance: number }>
): ClientListResponse[] => {
  return rows.map(
    (row): ClientListResponse => ({
      ...row,
      clientStatus: row.clientStatus,
      received: Math.round(Number(row.received ?? 0)),
      balance: Math.round(Number(row.balance ?? 0)),
    })
  );
};

/**
 * Paginated clients list (one row per client). Used by Elysia GET and +page.server.ts load.
 */
export const fetchPaginatedClients = async (
  userId: string,
  input: PaginationSearchParams
): Promise<CursorPaginatedList<ClientListResponse>> => {
  const { q, cursor, direction, limit } = input;
  const ws = baseFilter(userId, q);
  const take = limit + 1;

  const plan = resolveCursorListQuery(ws, cursor, direction, clientsTable.id);
  if (plan.kind === "first-page") {
    return fetchPaginatedClients(userId, {
      ...input,
      direction: "forward",
      cursor: undefined,
    });
  }

  const raw = await db
    .select({
      id: clientsTable.id,
      userId: clientsTable.userId,
      name: clientsTable.name,
      email: clientsTable.email,
      street: clientsTable.street,
      city: clientsTable.city,
      state: clientsTable.state,
      zip: clientsTable.zip,
      clientStatus: clientsTable.clientStatus,
      createdAt: clientsTable.createdAt,
      updatedAt: clientsTable.updatedAt,
      received: clientReceivedBalanceSubquery.received,
      balance: clientReceivedBalanceSubquery.balance,
    })
    .from(clientsTable)
    .leftJoin(
      clientReceivedBalanceSubquery,
      eq(clientsTable.id, clientReceivedBalanceSubquery.clientId)
    )
    .where(plan.where)
    .orderBy(plan.orderBy)
    .limit(take);

  return toPagination({
    rows: raw,
    limit,
    cursor,
    direction: plan.direction,
    map: mapRows,
  });
};
