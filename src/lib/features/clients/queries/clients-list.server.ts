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

/**
 * Substring search. Use RQB `like` (not `ilike`): SQLite/Turso have no `ILIKE`,
 * and `LIKE` is already case-insensitive for ASCII (Turso docs / SQLite default).
 * `lower(col) LIKE lower(?)` does not buy more — SQLite `lower()` is ASCII-only too.
 */
const searchWhere = (q: Maybe<string>) => {
  const trimmed = q?.trim();
  if (!trimmed) {
    return;
  }
  const pattern = `%${trimmed}%`;
  return {
    OR: [
      { name: { like: pattern } },
      { email: { like: pattern } },
      { street: { like: pattern } },
      { city: { like: pattern } },
      { state: { like: pattern } },
      { zip: { like: pattern } },
    ],
  };
};

/** Coerce driver extras to integer cents (`number`). See money note in `clientListHelpers`. */
const mapRows = (rows: ClientListResponse[]): ClientListResponse[] =>
  rows.map((row): ClientListResponse => ({
    ...row,
    balance: Math.round(Number(row.balance ?? 0)),
    clientStatus: row.clientStatus,
    received: Math.round(Number(row.received ?? 0)),
  }));

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
    baseWhere: ws,
    fetchPage: ({ where, orderBy, limit }) =>
      db.query.clients.findMany({
        extras: clientReceivedBalanceExtras,
        limit,
        orderBy,
        where,
      }),
    idColumn: clientsTable.id,
    input,
    map: mapRows,
  });
};
