import type { CursorId } from "#lib/schemas/cursor-id.ts";
import { andFilters } from "./base-filter";
import type { ListDirection } from "../types";

type CursorListQueryResolved =
  | { kind: "first-page" }
  | {
      kind: "query";
      where: Record<string, unknown>;
      orderBy: { id: "asc" | "desc" };
      direction: ListDirection;
    };

const mergeBaseAndCursor = (
  baseWhere: Record<string, unknown> | undefined,
  cursor: CursorId | undefined,
  direction: "forward" | "backward"
): Record<string, unknown> => {
  if (cursor === undefined) {
    return andFilters(baseWhere);
  }

  const cursorWhere =
    direction === "forward" ? { id: { gt: cursor } } : { id: { lt: cursor } };
  return andFilters(baseWhere, cursorWhere);
};

/**
 * Cursor pagination over a single monotonic `id` column for Drizzle RQB v2:
 * forward uses `id > cursor`, backward uses `id < cursor` with descending order
 * (reversed in `toPagination`).
 *
 * @param _idColumn — retained for call-site compatibility; cursor always targets `id`.
 */
export const resolveCursorListQuery = <TBase extends Record<string, unknown>>(
  baseWhere: TBase | undefined,
  cursor: CursorId | undefined,
  direction: ListDirection | undefined = "forward",
  _idColumn?: unknown
): CursorListQueryResolved => {
  if (direction === "backward") {
    if (!cursor) {
      return { kind: "first-page" };
    }
    return {
      direction: "backward",
      kind: "query",
      orderBy: { id: "desc" },
      where: mergeBaseAndCursor(baseWhere, cursor, "backward"),
    };
  }
  return {
    direction: "forward",
    kind: "query",
    orderBy: { id: "asc" },
    where: mergeBaseAndCursor(baseWhere, cursor, "forward"),
  };
};
