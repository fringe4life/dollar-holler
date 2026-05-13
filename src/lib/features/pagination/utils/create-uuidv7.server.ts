import { uuidv7 } from "uuidv7";
import type { CursorId } from "$lib/types";
/**
 * @description Creates a new UUIDv7 string.
 * @returns A new UUIDv7 string.
 */
export const createId = (): CursorId => uuidv7() as CursorId;
