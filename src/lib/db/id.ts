import type { CursorId } from "$lib/types";
import { type } from "arktype";

export const createId = (): CursorId => Bun.randomUUIDv7() as CursorId;

export const cursorSchema = type("(string.uuid.v7)").as<CursorId>();

export type CursorRow = { id: typeof cursorSchema.infer };
