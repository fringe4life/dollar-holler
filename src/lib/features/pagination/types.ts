import type { CursorId, Maybe } from "$lib/types";
import type {
  listDirectionSchema,
  listQueryWireSchema,
  paginationMetadataSchema,
} from "./schemas.server";

export interface NormalizeListQueryResult {
  /** True when a `cursor` query param was present but stripped as invalid. */
  listCursorWasNormalized: boolean;
  normalized: PaginationSearchParams;
}

export type ListDirection = typeof listDirectionSchema.infer;

/** Normalized list query (API + SSR + URL canonicalization). */
type ListQueryNormalized = typeof listQueryWireSchema.infer;

export type PaginationSearchParams = Omit<ListQueryNormalized, "limit"> & {
  limit: number;
};

export type PaginationMetadata = typeof paginationMetadataSchema.infer;

export interface CursorPaginatedList<T extends CursorRow> {
  items: T[];
  paginationMetadata: PaginationMetadata;
}

export interface CursorRow {
  id: CursorId;
}
/** Contract for list pages that load rows with optional `q` search and expose a loading flag for the Search UI. */
export interface SearchableListStore {
  readonly error?: string | null;
  loadItems(
    normalized: PaginationSearchParams,
    options?: { signal?: AbortSignal }
  ): Promise<void>;
  readonly loading: boolean;
  /**
   * Call immediately before `pushState` when changing list query from the client so
   * URL-sync effects do not refetch using a stale URL while `loadItems` is in flight.
   */
  presetClientListQueryKey?(normalized: PaginationSearchParams): void;
}

/** Cursor-paginated list store: list rows, URL sync key, and pagination flags for UI. */
export interface PaginatableItems<T extends CursorRow>
  extends SearchableListStore,
    CursorPaginatedList<T> {
  lastSuccessfulListKey: Maybe<string>;
}
