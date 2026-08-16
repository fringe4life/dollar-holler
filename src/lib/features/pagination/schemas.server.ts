import "#lib/utils/arktype.config.ts";
import { type } from "arktype";
import type { CursorId } from "#lib/types.ts";
/** Pagination metadata for cursor-paginated lists. */
export const paginationMetadataSchema = type({
  hasNextPage: "boolean",
  hasPreviousPage: "boolean",
});
/** ArkType rule for UUIDv7-shaped ids (DB row ids and list `cursor` values). */
export const cursorSchema = type("(string.uuid.v7)").as<CursorId>();

export const listDirectionSchema = type("'forward' | 'backward'");

/** Normalized list query for remote `query` arguments (numeric `limit`). */
export const listQuerySchema = type({
  "cursor?": cursorSchema,
  "direction?": listDirectionSchema,
  limit: type("10 | 25 | 50"),
  "q?": "string",
});

export const idSchema = type({
  id: cursorSchema,
});
