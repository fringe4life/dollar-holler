import type { apiErrorBodySchema } from "./schemas";

export type ApiErrorBody = typeof apiErrorBodySchema.infer;
