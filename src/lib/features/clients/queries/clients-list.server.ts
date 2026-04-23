import { clientReceivedBalanceExtras } from "$features/clients/queries/clientListHelpers";
import type { ClientListResponse } from "$features/clients/types";
import type {
  CursorPaginatedList,
  PaginationSearchParams,
} from "$features/pagination/types";
import { withUserAndSearch } from "$features/pagination/utils/base-filter";
import { fetchCursorPaginatedList } from "$features/pagination/utils/cursor-paginated-fetch.server";
import { db } from "$lib/server/db";
import { clients as clientsTable } from "$lib/server/db/schema";
import type { Maybe } from "$lib/types";

const searchWhere = (q: Maybe<string>) => {
  const trimmed = q?.trim();
  if (!trimmed) {
    return;
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

const mapRows = (rows: ClientListResponse[]): ClientListResponse[] =>
  rows.map(
    (row): ClientListResponse => ({
      ...row,
      clientStatus: row.clientStatus,
      received: Math.round(Number(row.received ?? 0)),
      balance: Math.round(Number(row.balance ?? 0)),
    })
  );

/**
 * Paginated clients list (one row per client). Used by Elysia GET and +page.server.ts load.
 */

// biome-ignore lint/suspicious/useAwait: await is not needed for fetchCursorPaginatedList
export const fetchPaginatedClients = async (
  userId: string,
  input: PaginationSearchParams
): Promise<CursorPaginatedList<ClientListResponse>> => {
  const ws = withUserAndSearch(userId, searchWhere(input.q));
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
