import { DEFAULT_PAGINATION_METADATA } from "$lib/features/pagination/constants";
import type {
  CursorPaginatedList,
  CursorRow,
  PaginatableItems,
  PaginationMetadata,
  PaginationSearchParams,
} from "$lib/features/pagination/types";
import {
  normalizedToQueryRecord,
  serializeNormalizedForKey,
} from "$lib/features/pagination/utils/url";
import type { Maybe } from "$lib/types";
import {
  StoreOperation,
  getErrorMessage,
  isAbortError,
} from "$lib/utils/error-message";
import { toast } from "svelte-sonner";
import { StoreResourceErrorBase } from "./store-resource-error-base.svelte";

export abstract class CursorPaginatedListStoreBase<T extends CursorRow>
  extends StoreResourceErrorBase<T>
  implements PaginatableItems<T>
{
  paginationMetadata = $state<PaginationMetadata>({
    hasNextPage: false,
    hasPreviousPage: false,
  });

  lastSuccessfulListKey = $state<Maybe<string>>(null);

  private listAbortController: AbortController | null = null;
  private listLoadGeneration = 0;

  protected abstract fetchList(
    query: Record<string, string>,
    signal: AbortSignal
  ): Promise<CursorPaginatedList<T>>;

  hydrateFromLoad(data: CursorPaginatedList<T>, urlKey: string) {
    this.items.length = 0;
    this.items.push(...data.items);
    this.paginationMetadata = { ...data.paginationMetadata };
    this.lastSuccessfulListKey = urlKey;
    this.error = null;
    this.loading = false;
  }

  /**
   * Must run before client `pushState` when updating list URL (see {@link SearchableListStore}).
   * Sets `loading` so URL-sync effects do not refetch while `lastSuccessfulListKey` is ahead of
   * `page.url` for one synchronous tick.
   */
  presetClientListQueryKey(normalized: PaginationSearchParams): void {
    this.loading = true;
    this.lastSuccessfulListKey = serializeNormalizedForKey(normalized);
  }

  async loadItems(
    normalized: PaginationSearchParams,
    options?: { signal?: AbortSignal }
  ) {
    // abort any previous work
    this.listAbortController?.abort();
    // create a new abort controller
    this.listAbortController = new AbortController();
    // increment the generation
    const generation = ++this.listLoadGeneration;

    // get the internal signal
    const internal = this.listAbortController.signal;
    // get the signal from the options
    const signal =
      options?.signal && typeof AbortSignal.any === "function"
        ? AbortSignal.any([internal, options.signal])
        : internal;

    // set the loading state to true
    this.loading = true;
    this.error = null;

    // convert the normalized query to a query record
    const query = normalizedToQueryRecord(normalized);

    const fallback = this.fallbackFor(StoreOperation.loadMany);

    try {
      // fetch the list
      const body = await this.fetchList(query, signal);
      if (generation !== this.listLoadGeneration) {
        return;
      }
      // Mutate `items` in place: keeps one array reference for the store and avoids
      // copying the page (e.g. `this.items = [...body.items]` each load).
      this.items.length = 0;
      // push the new items
      this.items.push(...body.items);
      // set the pagination metadata
      this.paginationMetadata = { ...body.paginationMetadata };
      this.lastSuccessfulListKey = serializeNormalizedForKey(normalized);
    } catch (err) {
      if (isAbortError(err)) {
        return;
      }
      const errorMessage = getErrorMessage(err, fallback);
      this.error = errorMessage;
      console.error(fallback, err);
      toast.error(errorMessage);
    } finally {
      if (generation === this.listLoadGeneration) {
        this.loading = false;
      }
    }
  }

  resetList() {
    this.resetLoadableListState();
    this.lastSuccessfulListKey = null;
    this.paginationMetadata = DEFAULT_PAGINATION_METADATA;
  }
}
