import type { apiErrorBodySchema, idResponseSchema } from "./schemas";

export type ApiErrorBody = typeof apiErrorBodySchema.infer;

export type IdResponse = typeof idResponseSchema.infer;
