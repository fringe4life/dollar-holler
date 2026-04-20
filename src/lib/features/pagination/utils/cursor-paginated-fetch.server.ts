import type {
  CursorPaginatedList,
  CursorRow,
  PaginationSearchParams,
} from "$lib/features/pagination/types";
import { resolveCursorListQuery } from "$lib/features/pagination/utils/cursor-list-query.server";
import { toPagination } from "$lib/features/pagination/utils/to-pagination.server";

export interface FetchPageArgs {
  where: Record<string, unknown>;
  orderBy: { id: "asc" | "desc" };
  limit: number;
}

export interface FetchCursorPaginatedListParams<
  R,
  T extends CursorRow,
  TBase extends Record<string, unknown> = Record<string, unknown>,
> {
  input: PaginationSearchParams;
  baseWhere: TBase | undefined;
  idColumn?: unknown;
  map: (rows: R[]) => T[];
  fetchPage: (args: FetchPageArgs) => Promise<R[]>;
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
      input: { ...input, direction: "forward", cursor: undefined },
      baseWhere,
      idColumn,
      map,
      fetchPage,
    });
  }

  const raw = await fetchPage({
    where: plan.where,
    orderBy: plan.orderBy,
    limit: take,
  });

  return toPagination({
    rows: raw,
    limit,
    cursor,
    direction: plan.direction,
    map,
  });
};
