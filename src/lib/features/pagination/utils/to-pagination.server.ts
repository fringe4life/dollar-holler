import type {
  CursorPaginatedList,
  CursorRow,
} from "$features/pagination/types";
import type { CursorId } from "$lib/types";
import { DEFAULT_PAGINATION_METADATA } from "../constants";
import type { ListDirection } from "../types";

interface ToPaginationParams<R, T extends CursorRow> {
  cursor: CursorId | undefined;
  direction: ListDirection;
  limit: number;
  map: (pageRows: R[]) => T[];
  rows: R[];
}

/**
 * Turns a `limit + 1` query result into items plus cursor pagination metadata.
 * Applies slice, optional reverse for backward direction, then `map`.
 */
export const toPagination = <R, T extends CursorRow>({
  rows,
  limit,
  cursor,
  direction,
  map,
}: ToPaginationParams<R, T>): CursorPaginatedList<T> => {
  if (rows.length === 0) {
    return {
      items: [],
      paginationMetadata: DEFAULT_PAGINATION_METADATA,
    };
  }

  const hasMoreResults = rows.length > limit;
  const pageRows = rows.slice(0, limit);
  const ordered = direction === "backward" ? [...pageRows].reverse() : pageRows;
  const items = map(ordered);

  const hasNextPage =
    direction === "forward" ? hasMoreResults : Boolean(cursor);
  const hasPreviousPage =
    direction === "forward" ? Boolean(cursor) : hasMoreResults;

  return {
    items,
    paginationMetadata: { hasNextPage, hasPreviousPage },
  };
};
