import { parse } from "valibot";
import { uuidv7 } from "uuidv7";
import { cursorSchema, type CursorId } from "#lib/schemas/cursor-id.ts";

/** UUIDv7 for primary keys and cursor pagination (server-only callers). */
export const createId = (): CursorId => parse(cursorSchema, uuidv7());
