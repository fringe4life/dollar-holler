import type { CursorId } from "#lib/schemas/cursor-id.ts";
import type { CursorPaginatedList, CursorRow } from "../types";

export const omitListItem = <T extends CursorRow>(
  list: CursorPaginatedList<T>,
  id: CursorId
): CursorPaginatedList<T> => ({
  ...list,
  items: list.items.filter((item) => item.id !== id),
});
