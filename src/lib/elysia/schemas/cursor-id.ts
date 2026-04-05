import { t } from "elysia";
import type { CursorId } from "$lib/types";

/**
 * TypeBox: `uuid` JSON-Schema format (compiles with TypeCompiler; UUID v7 strings validate).
 * Elysia infers `string` for params/body — treat as {@link CursorId} at app boundaries.
 *
 * **Do not use `t.Unsafe({ type: "string" })` here:** TypeBox’s compiler throws
 * `Unknown type` on Kind `Unsafe` when Elysia builds validators (`TypeCompiler.Compile`).
 *
 * **Drizzle relational `findFirst` / `findMany`:** branded ids are `object`-like in
 * TypeScript, so do not use shorthand `where: { id }`. Use
 * `where: { id: { eq: id }, userId: { eq: user.id } }` (or the SQL callback form).
 */
export const cursorId = t.String({ format: "uuid" });

export const optionalCursorId = t.Optional(cursorId);
