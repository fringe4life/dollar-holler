import { client } from "$lib/client";
import type { ClientInvoiceSummaryCents } from "$lib/features/invoices/client-invoice-summary";
import type { InvoiceListResponse } from "$lib/features/invoices/types";
import type {
  CursorPaginatedList,
  PaginationSearchParams,
} from "$lib/features/pagination/types";
import {
  normalizedToQueryRecord,
  serializeNormalizedForKey,
} from "$lib/features/pagination/utils/url";
import { CursorPaginatedListStoreBase } from "$lib/stores/cursor-paginated-base.svelte";
import type { CursorId, Maybe } from "$lib/types";
import {
  StoreOperation,
  getErrorMessage,
  isAbortError,
} from "$lib/utils/error-message";
import { unwrapTreatyResult } from "$lib/utils/unwrap";
import { toast } from "svelte-sonner";

export class ClientInvoicesStore extends CursorPaginatedListStoreBase<InvoiceListResponse> {
  protected readonly resourceSingular = "invoice";
  protected readonly resourcePlural = "invoices";

  summary = $state<Maybe<ClientInvoiceSummaryCents>>(null);

  constructor(readonly clientId: CursorId) {
    super();
  }

  protected async fetchList(
    query: Record<string, string>,
    signal: AbortSignal
  ): Promise<CursorPaginatedList<InvoiceListResponse>> {
    return unwrapTreatyResult(
      await client.api.clients({ id: this.clientId }).invoices.get({
        query,
        fetch: { signal },
      }),
      { fallbackMessage: this.fallbackFor(StoreOperation.loadMany) }
    );
  }

  private async fetchSummary(
    normalized: PaginationSearchParams,
    signal: AbortSignal
  ): Promise<ClientInvoiceSummaryCents> {
    return unwrapTreatyResult(
      await client.api.clients({ id: this.clientId }).invoices.summary.get({
        query: normalized.q ? { q: normalized.q } : {},
        fetch: { signal },
      }),
      { fallbackMessage: "Failed to load invoice summary" }
    );
  }

  hydrateListAndSummaryFromLoad(
    data: CursorPaginatedList<InvoiceListResponse>,
    urlKey: string,
    summary: ClientInvoiceSummaryCents
  ) {
    super.hydrateFromLoad(data, urlKey);
    this.summary = summary;
  }

  async loadItems(
    normalized: PaginationSearchParams,
    options?: { signal?: AbortSignal }
  ) {
    this.listAbortController?.abort();
    this.listAbortController = new AbortController();
    const generation = ++this.listLoadGeneration;

    const internal = this.listAbortController.signal;
    const signal =
      options?.signal && typeof AbortSignal.any === "function"
        ? AbortSignal.any([internal, options.signal])
        : internal;

    this.loading = true;
    this.error = null;

    const query = normalizedToQueryRecord(normalized);

    const fallback = this.fallbackFor(StoreOperation.loadMany);

    try {
      const [body, summary] = await Promise.all([
        this.fetchList(query, signal),
        this.fetchSummary(normalized, signal),
      ]);
      if (generation !== this.listLoadGeneration) {
        return;
      }
      this.items.length = 0;
      this.items.push(...body.items);
      this.paginationMetadata = { ...body.paginationMetadata };
      this.lastSuccessfulListKey = serializeNormalizedForKey(normalized);
      this.summary = summary;
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

  reset() {
    this.resetList();
    this.summary = null;
  }
}
