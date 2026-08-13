import type { PaginationMetadata } from "./types";

export const LIMITS = [10, 25, 50] as const;
export type ListLimit = (typeof LIMITS)[number];
export const [DEFAULT_LIMIT] = LIMITS;
export const DEFAULT_PAGINATION_METADATA = {
  hasNextPage: false,
  hasPreviousPage: false,
} satisfies PaginationMetadata;
