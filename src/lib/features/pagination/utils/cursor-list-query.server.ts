import type { CursorId } from "$lib/types";
import type { AnyColumn, SQL } from "drizzle-orm";
import { and, asc, desc, gt, lt, sql } from "drizzle-orm";
import type { ListDirection } from "../types";

export type CursorListQueryResolved =
  | { kind: "first-page" }
  | {
      kind: "query";
      where: SQL;
      orderBy: SQL;
      direction: ListDirection;
    };

/**
 * Cursor pagination over a single monotonic `id` column: forward uses `id > cursor`,
 * backward uses `id < cursor` with descending order (reversed in `toPagination`).
 */
export const resolveCursorListQuery = (
  baseWhere: SQL | undefined,
  cursor: CursorId | undefined,
  direction: ListDirection,
  idColumn: AnyColumn
): CursorListQueryResolved => {
  const ws = baseWhere ?? sql`true`;
  if (direction === "backward") {
    if (!cursor) {
      return { kind: "first-page" };
    }
    return {
      kind: "query",
      where: and(ws, lt(idColumn, cursor)) as SQL,
      orderBy: desc(idColumn),
      direction: "backward",
    };
  }
  return {
    kind: "query",
    where: cursor ? (and(ws, gt(idColumn, cursor)) as SQL) : ws,
    orderBy: asc(idColumn),
    direction: "forward",
  };
};
