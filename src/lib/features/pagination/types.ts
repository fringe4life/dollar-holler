import type { InferOutput } from "valibot";
import type { CursorId } from "#lib/types.ts";
import type {
  listDirectionSchema,
  listQuerySchema,
  paginationMetadataSchema,
} from "./schemas";

export type PaginationSearchParamsRaw = {
  [key in keyof Required<PaginationSearchParams>]: string | undefined;
};

export interface NormalizeListQueryResult {
  /** True when a `cursor` query param was present but stripped as invalid. */
  listCursorWasNormalized: boolean;
  normalized: PaginationSearchParams;
}

export type ListDirection = InferOutput<typeof listDirectionSchema>;

/** Normalized list query (remotes + URL canonicalization). */
export type PaginationSearchParams = InferOutput<typeof listQuerySchema>;

export type PaginationMetadata = InferOutput<typeof paginationMetadataSchema>;

export interface CursorPaginatedList<T extends CursorRow> {
  items: T[];
  paginationMetadata: PaginationMetadata;
}

export interface CursorRow {
  id: CursorId;
}
