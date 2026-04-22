/**
 * Shared ArkType schemas for Elysia `response` maps and API error bodies.
 * Prefer composing from feature `schemas.server` Drizzle-backed schemas via `.merge()`.
 */

import { cursorSchema } from "$features/pagination/schemas.server";
import { type } from "arktype";
/** Standard JSON error body for `status(4xx|5xx, { message })`. */
export const apiErrorBodySchema = type({
  message: "string",
});

export const idResponseSchema = type({
  id: cursorSchema,
});

export const deleteSuccessSchema = type({
  success: "true",
});
