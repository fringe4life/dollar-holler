import type { InvoiceListResponse } from "$features/invoices/types";
import type { ClientInvoiceSummaryCents } from "$features/invoices/utils/client-invoice-summary";
import type {
  CursorPaginatedList,
  PaginationSearchParams,
} from "$features/pagination/types";
import {
  normalizedToQueryRecord,
  serializeNormalizedForKey,
} from "$features/pagination/utils/url";
import { apiClient } from "$lib/api";
import type { InvoiceStatus } from "$lib/server/db/types";
import { CursorPaginatedListStoreBase } from "$lib/stores/cursor-paginated-base.svelte";
import type { CursorId, Maybe } from "$lib/types";
import {
  getErrorMessage,
  isAbortError,
  StoreOperation,
} from "$lib/utils/error-message";
import { toast } from "$lib/utils/toast.svelte";
import { unwrapTreaty, unwrapTreatyResult } from "$lib/utils/unwrap";

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
      await apiClient.clients({ id: this.clientId }).invoices.get({
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
      await apiClient.clients({ id: this.clientId }).invoices.summary.get({
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

  async updateInvoiceStatus(
    invoiceId: CursorId,
    invoiceStatus: InvoiceStatus,
    normalized: PaginationSearchParams
  ) {
    const fb = "Failed to update invoice status";
    try {
      await unwrapTreaty(
        apiClient.invoices({ id: invoiceId }).patch({ invoiceStatus }),
        { fallbackMessage: fb }
      );

      const index = this.items.findIndex((invoice) => invoice.id === invoiceId);
      if (index !== -1) {
        this.items[index] = {
          ...this.items[index],
          invoiceStatus,
          updatedAt: new Date(),
        };
      }

      const summarySignal = new AbortController().signal;
      this.summary = await this.fetchSummary(normalized, summarySignal);
      toast.success("Invoice updated successfully");
    } catch (err) {
      const errorMessage = getErrorMessage(err, fb);
      console.error("Error updating invoice status:", err);
      toast.error(errorMessage);
    }
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
