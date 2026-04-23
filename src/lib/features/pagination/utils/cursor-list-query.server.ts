import type { CursorId } from "$lib/types";
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
  const parts: Record<string, unknown>[] = [];
  if (baseWhere) {
    parts.push(baseWhere);
  }
  if (cursor) {
    parts.push(
      direction === "forward" ? { id: { gt: cursor } } : { id: { lt: cursor } }
    );
  }
  if (parts.length === 0) {
    return {};
  }
  if (parts.length === 1) {
    return parts[0];
  }
  return { AND: parts };
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
      kind: "query",
      where: mergeBaseAndCursor(baseWhere, cursor, "backward"),
      orderBy: { id: "desc" },
      direction: "backward",
    };
  }
  return {
    kind: "query",
    where: mergeBaseAndCursor(baseWhere, cursor, "forward"),
    orderBy: { id: "asc" },
    direction: "forward",
  };
};
