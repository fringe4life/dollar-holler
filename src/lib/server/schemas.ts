/**
 * Shared ArkType schemas for Elysia `response` maps and API error bodies.
 * Prefer composing from `$lib/validators` Drizzle-backed schemas via `.merge()`.
 */

import { cursorSchema } from "$lib/features/pagination/schemas";
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
