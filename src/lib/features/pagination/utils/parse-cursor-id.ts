import { safeParse } from "valibot";
import { cursorSchema, type CursorId } from "#lib/schemas/cursor-id.ts";

/** Returns branded `CursorId` when `raw` matches UUIDv7 wire shape; otherwise `false`. */
export function tryParseCursorId(raw: string): CursorId | false {
  const result = safeParse(cursorSchema, raw);
  return result.success ? result.output : false;
}
