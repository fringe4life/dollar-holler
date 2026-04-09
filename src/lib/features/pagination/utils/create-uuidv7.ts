import type { CursorId } from "$lib/types";

export const createId = (): CursorId => Bun.randomUUIDv7() as CursorId;
