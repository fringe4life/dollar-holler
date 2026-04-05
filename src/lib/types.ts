import type { MouseEventHandler } from "svelte/elements";

export type Maybe<T> = T | null | undefined;
export type List<T> = Maybe<T[]>;
export type BitsButton = MouseEventHandler<HTMLButtonElement> &
  MouseEventHandler<HTMLAnchorElement>;

declare const __brand: unique symbol;
export type Brand<T, U extends string> = T & { [__brand]: U };

export type SanitizedHTML = Brand<string, "SanitizedHTML">;
export type CursorId = Brand<string, "CursorId">;

export interface CursorPaginatedList<T extends CursorRow> {
  items: T[];
  paginationMetadata: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CursorRow {
  id: CursorId;
}
/** Contract for list pages that load rows with optional `q` search and expose a loading flag for the Search UI. */
export interface SearchableListStore {
  loadItems(
    searchQuery?: string,
    options?: { signal?: AbortSignal }
  ): Promise<void>;
}
