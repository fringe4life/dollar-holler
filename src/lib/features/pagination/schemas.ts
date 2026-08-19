import { boolean, object, optional, picklist, string } from "valibot";
import { cursorSchema } from "#lib/schemas/cursor-id.ts";

/** Pagination metadata for cursor-paginated lists. */
export const paginationMetadataSchema = object({
  hasNextPage: boolean(),
  hasPreviousPage: boolean(),
});

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
