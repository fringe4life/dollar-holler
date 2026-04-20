import { db } from "$lib/db";
import { clients as clientsTable } from "$lib/db/schema";
import { clientReceivedBalanceExtras } from "$lib/features/clients/queries/clientListHelpers";
import type { ClientListResponse } from "$lib/features/clients/types";
import type {
  CursorPaginatedList,
  PaginationSearchParams,
} from "$lib/features/pagination/types";
import { fetchCursorPaginatedList } from "$lib/features/pagination/utils/cursor-paginated-fetch.server";
import type { Maybe } from "$lib/types";

const searchWhere = (q: Maybe<string>) => {
  const trimmed = q?.trim();
  if (!trimmed) {
    return undefined;
  }
  const pattern = `%${trimmed}%`;
  return {
    OR: [
      { name: { ilike: pattern } },
      { email: { ilike: pattern } },
      { street: { ilike: pattern } },
      { city: { ilike: pattern } },
      { state: { ilike: pattern } },
      { zip: { ilike: pattern } },
      /** Enum `client_status` cannot use ILIKE in Postgres without a cast (same as invoice list). */
    ],
  };
};

const baseFilter = (userId: string, q: Maybe<string>) => {
  const base = { userId: { eq: userId } };
  const sw = searchWhere(q);
  return sw ? { AND: [base, sw] } : base;
};

const mapRows = (rows: Array<ClientListResponse>): ClientListResponse[] => {
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
  const ws = baseFilter(userId, input.q);
  return fetchCursorPaginatedList({
    input,
    baseWhere: ws,
    idColumn: clientsTable.id,
    map: mapRows,
    fetchPage: ({ where, orderBy, limit }) =>
      db.query.clients.findMany({
        where,
        extras: clientReceivedBalanceExtras,
        orderBy,
        limit,
      }),
  });
};
