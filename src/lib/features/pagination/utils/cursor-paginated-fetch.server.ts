import type {
  CursorPaginatedList,
  CursorRow,
  PaginationSearchParams,
} from "$features/pagination/types";
import { resolveCursorListQuery } from "$features/pagination/utils/cursor-list-query.server";
import { toPagination } from "$features/pagination/utils/to-pagination.server";

export interface FetchPageArgs {
  limit: number;
  orderBy: { id: "asc" | "desc" };
  where: Record<string, unknown>;
}

interface FetchCursorPaginatedListParams<
  R,
  T extends CursorRow,
  TBase extends Record<string, unknown> = Record<string, unknown>,
> {
  baseWhere: TBase | undefined;
  fetchPage: (args: FetchPageArgs) => Promise<R[]>;
  idColumn?: unknown;
  input: PaginationSearchParams;
  map: (rows: R[]) => T[];
}

/**
 * Cursor pagination over monotonic `id`: resolves where/order, handles backward-without-cursor
 * as first forward page, runs `fetchPage` with `limit + 1`, then `toPagination`.
 */
export const fetchCursorPaginatedList = async <
  R,
  T extends CursorRow,
  TBase extends Record<string, unknown> = Record<string, unknown>,
>({
  input,
  baseWhere,
  idColumn,
  map,
  fetchPage,
}: FetchCursorPaginatedListParams<R, T, TBase>): Promise<
  CursorPaginatedList<T>
> => {
  const { cursor, direction, limit } = input;
  const take = limit + 1;
  const plan = resolveCursorListQuery(baseWhere, cursor, direction, idColumn);
  if (plan.kind === "first-page") {
    return fetchCursorPaginatedList({
      baseWhere,
      fetchPage,
      idColumn,
      input: { ...input, cursor: undefined, direction: "forward" },
      map,
    });
  }

  const raw = await fetchPage({
    limit: take,
    orderBy: plan.orderBy,
    where: plan.where,
  });

  return toPagination({
    cursor,
    direction: plan.direction,
    limit,
    map,
    rows: raw,
  });
};
