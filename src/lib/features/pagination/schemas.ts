import {
  boolean,
  object,
  optional,
  picklist,
  pipe,
  regex,
  string,
  transform,
} from "valibot";
import type { CursorId } from "#lib/types.ts";

/** UUIDv7: version nibble is 7, RFC variant is 8/9/a/b. */
const UUID_V7 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Pagination metadata for cursor-paginated lists. */
export const paginationMetadataSchema = object({
  hasNextPage: boolean(),
  hasPreviousPage: boolean(),
});

/** Valibot rule for UUIDv7-shaped ids (DB row ids and list `cursor` values). */
export const cursorSchema = pipe(
  string(),
  regex(UUID_V7, "Invalid cursor id"),
  transform((id): CursorId => id as CursorId)
);

export const listDirectionSchema = picklist(["forward", "backward"]);

/** Normalized list query for remote `query` arguments (numeric `limit`). */
export const listQuerySchema = object({
  cursor: optional(cursorSchema),
  direction: optional(listDirectionSchema),
  limit: picklist([10, 25, 50]),
  q: optional(string()),
});

export const idSchema = object({
  id: cursorSchema,
});
