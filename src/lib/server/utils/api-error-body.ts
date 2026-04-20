import { type } from "arktype";
import { apiErrorBodySchema } from "../schemas";
import type { ApiErrorBody } from "../types";

/** Validated `{ message }` for `status()` and global `onError` handlers. */
export const apiErrorBody = (message: string): ApiErrorBody => {
  const result = apiErrorBodySchema({ message });
  if (result instanceof type.errors) {
    throw new Error(result.summary);
  }
  return result;
};
