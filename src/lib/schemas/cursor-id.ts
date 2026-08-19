import { brand, pipe, regex, string, type InferOutput } from "valibot";

/** UUIDv7: version nibble is 7, RFC variant is 8/9/a/b. */
const UUID_V7_CURSOR =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Valibot rule for UUIDv7-shaped ids (DB row ids, list cursors, route params). */
export const cursorSchema = pipe(
  string(),
  regex(UUID_V7_CURSOR, "Invalid cursor id"),
  brand("CursorId")
);

export type CursorId = InferOutput<typeof cursorSchema>;
