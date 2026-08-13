import type { CursorId } from "#lib/types";
import type {
  listDirectionSchema,
  listQuerySchema,
  paginationMetadataSchema,
} from "./schemas.server";

export type PaginationSearchParamsRaw = {
  [key in keyof Required<PaginationSearchParams>]: string | undefined;
};

export interface NormalizeListQueryResult {
  /** True when a `cursor` query param was present but stripped as invalid. */
  listCursorWasNormalized: boolean;
  normalized: PaginationSearchParams;
}

export type ListDirection = typeof listDirectionSchema.infer;

/** Normalized list query (remotes + URL canonicalization). */
export type PaginationSearchParams = typeof listQuerySchema.infer;

export type PaginationMetadata = typeof paginationMetadataSchema.infer;

export interface CursorPaginatedList<T extends CursorRow> {
  items: T[];
  paginationMetadata: PaginationMetadata;
}

export interface CursorRow {
  id: CursorId;
}
