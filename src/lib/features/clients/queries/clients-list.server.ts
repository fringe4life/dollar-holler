import { fetchClientReceivedBalanceForIds } from "#lib/features/clients/queries/client-list-helpers.ts";
import type { ClientListResponse } from "#features/clients/types";
import type {
  CursorPaginatedList,
  PaginationSearchParams,
} from "#features/pagination/types";
import { withUserAndSearch } from "#features/pagination/utils/base-filter";
import { fetchCursorPaginatedList } from "#features/pagination/utils/cursor-paginated-fetch.server";
import { db } from "#lib/server/db";
import { clients as clientsTable } from "#lib/server/db/schema";
import type { Maybe } from "#lib/types";

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

/**
 * Paginated clients list (one row per client). Used by Elysia GET and +page.server.ts load.
 * Money columns come from a batch CTE after the page of clients is known (A+B).
 */
export const fetchPaginatedClients = async (
  userId: string,
  input: PaginationSearchParams
): Promise<CursorPaginatedList<ClientListResponse>> => {
  const ws = withUserAndSearch(userId, searchWhere(input.q));
  return fetchCursorPaginatedList({
    baseWhere: ws,
    fetchPage: async ({ where, orderBy, limit }) => {
      const rows = await db.query.clients.findMany({
        limit,
        orderBy,
        where,
      });
      const moneyByClient = await fetchClientReceivedBalanceForIds(
        rows.map((row) => row.id)
      );
      return rows.map((row): ClientListResponse => {
        const money = moneyByClient.get(row.id) ?? {
          balance: 0,
          received: 0,
        };
        const { userId: _userId, ...client } = row;
        return {
          ...client,
          balance: money.balance,
          received: money.received,
        };
      });
    },
    idColumn: clientsTable.id,
    input,
    map: (rows) => rows,
  });
};
