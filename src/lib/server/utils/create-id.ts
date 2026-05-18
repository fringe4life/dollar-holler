import { uuidv7 } from "uuidv7";
import type { CursorId } from "../../types";

/** UUIDv7 for primary keys and cursor pagination (server-only callers). */
export const createId = (): CursorId => uuidv7() as CursorId;
