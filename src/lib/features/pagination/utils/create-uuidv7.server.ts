import { randomUUIDv7 } from "bun";
import type { CursorId } from "$lib/types";
/**
 * @description Creates a new UUIDv7 string.
 * @returns A new UUIDv7 string.
 */
export const createId = (): CursorId => randomUUIDv7() as CursorId;
