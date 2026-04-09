import type { PaginationMetadata } from "./types";

export const LIMITS = [10, 25, 50] as const;
export const DEFAULT_LIMIT = LIMITS[0];
export const DEFAULT_PAGINATION_METADATA = {
  hasNextPage: false,
  hasPreviousPage: false,
} satisfies PaginationMetadata;
