import type { CursorId } from "$lib/types";
import { type } from "arktype";
import { LIMITS } from "./constants";
import type { CursorRow } from "./types";
export const paginationMetadataSchema = type({
  hasNextPage: "boolean",
  hasPreviousPage: "boolean",
});
/** ArkType rule for UUIDv7-shaped ids (DB row ids and list `cursor` values). */
export const cursorSchema = type("(string.uuid.v7)").as<CursorId>();

export const listDirectionSchema = type("'forward' | 'backward' | undefined");

// Concept: join into one TS-style union string, then pass to type(...)
const limitUnion = LIMITS.map((n) => `'${n}'`).join(
  " | "
) as unknown as `'${(typeof LIMITS)[number]}'`;
export const limitSchema = type(limitUnion);

export const querySchema = type({
  "q?": "string",
});

/** Loose wire shape for Elysia query (all string | undefined). */
export const listQueryWireSchema = type({
  "q?": "string",
  "cursor?": cursorSchema,
  "direction?": listDirectionSchema,
  "limit?": limitSchema,
});

export const paginationSchema = <t extends CursorRow>(of: type.Any<t>) =>
  type({
    items: of.array(),
    paginationMetadata: paginationMetadataSchema,
  });
