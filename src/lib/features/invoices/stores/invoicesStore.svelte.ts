import type { CursorPaginatedList } from "$features/pagination/types";
import { apiClient } from "$lib/api";
import type { InvoiceStatus } from "$lib/server/db/types";
import { CursorPaginatedListStoreBase } from "$lib/stores/cursor-paginated-base.svelte";
import type { StoreOption } from "$lib/stores/types";
import type { CursorId, Maybe } from "$lib/types";
import { today } from "$lib/utils/dateHelpers";
import {
  getErrorMessage,
  isAbortError,
  StoreOperation,
} from "$lib/utils/error-message";
import { toast } from "$lib/utils/toast.svelte";
import { unwrapTreaty, unwrapTreatyResult } from "$lib/utils/unwrap";
import type {
  InvoiceInsert,
  InvoiceListResponse,
  InvoiceSelect,
  InvoiceUpdate,
  NewInvoice,
} from "../types";

export class InvoicesStore extends CursorPaginatedListStoreBase<InvoiceListResponse> {
  protected readonly resourceSingular = "invoice";
  protected readonly resourcePlural = "invoices";

  newInvoice(): NewInvoice {
    return {
      clientId: undefined,
      discount: 0,
      dueDate: today,
      invoiceNumber: "",
      invoiceStatus: "draft",
      issueDate: today,
      notes: null,
      subject: "",
      terms: null,
    };
  }

  protected async fetchList(
    query: Record<string, string>,
    signal: AbortSignal
  ): Promise<CursorPaginatedList<InvoiceListResponse>> {
    return unwrapTreatyResult(
      await apiClient.invoices.get({
        fetch: { signal },
        query,
      }),
      { fallbackMessage: this.fallbackFor(StoreOperation.loadMany) }
    );
  }

  async loadInvoiceById(
    id: string,
    options?: StoreOption
  ): Promise<Maybe<InvoiceSelect>> {
    const fallback = this.fallbackFor(StoreOperation.loadOne);
    try {
      return await unwrapTreaty(
        apiClient
          .invoices({ id })
          .get(
            options?.signal ? { fetch: { signal: options.signal } } : undefined
          ),
        {
          fallbackMessage: fallback,
        }
      );
    } catch (error) {
      if (isAbortError(error)) {
        return null;
      }
      const errorMessage = getErrorMessage(error, fallback);
      console.error("Error loading invoice:", error);
      toast.error(errorMessage);
      return null;
    }
  }

  async updateInvoiceStatus(invoiceId: CursorId, invoiceStatus: InvoiceStatus) {
    const fb = "Failed to update invoice status";
    try {
      await unwrapTreaty(
        apiClient.invoices({ id: invoiceId }).patch({ invoiceStatus }),
        { fallbackMessage: fb }
      );

      const index = this.items.findIndex((invoice) => invoice.id === invoiceId);
      if (index === -1) {
        throw new Error("Invoice not found");
      }
      this.items[index] = {
        ...this.items[index],
        invoiceStatus,
        updatedAt: new Date(),
      };
      toast.success("Invoice updated successfully");
    } catch (err) {
      const errorMessage = getErrorMessage(err, fb);
      console.error("Error updating invoice status:", err);
      toast.error(errorMessage);
    }
  }

  async deleteInvoice(invoiceId: string) {
    const fallback = this.fallbackFor(StoreOperation.deleteOne);
    try {
      await unwrapTreaty(apiClient.invoices({ id: invoiceId }).delete(), {
        fallbackMessage: fallback,
      });

      const index = this.items.findIndex((invoice) => invoice.id === invoiceId);
      if (index !== -1) {
        this.items.splice(index, 1);
      }
      toast.success("Invoice deleted successfully");
    } catch (err) {
      const errorMessage = getErrorMessage(err, fallback);
      console.error("Error deleting invoice:", err);
      toast.error(errorMessage);
    }
  }

  async updateInvoice(
    id: CursorId,
    patch: InvoiceUpdate
  ): Promise<Maybe<CursorId>> {
    try {
      const responseData = await unwrapTreaty(
        apiClient.invoices({ id }).patch(patch),
        { fallbackMessage: this.fallbackFor(StoreOperation.updateOne) }
      );
      toast.success("Invoice updated successfully");
      const index = this.items.findIndex(
        (invoice) => invoice.id === responseData.id
      );
      if (index !== -1) {
        // PATCH returns `{ id }` only; list rows omit notes/terms HTML anyway.
        this.items[index] = {
          ...this.items[index],
          ...patch,
          updatedAt: new Date(),
        };
      }
      return responseData.id;
    } catch (err) {
      const fallback = this.fallbackFor(StoreOperation.updateOne);
      const errorMessage = getErrorMessage(err, fallback);
      console.error("Error updating invoice:", err);
      toast.error(errorMessage);
      return null;
    }
  }

  async createInvoice(invoiceData: InvoiceInsert): Promise<Maybe<CursorId>> {
    try {
      const responseData = await unwrapTreaty(
        apiClient.invoices.post(invoiceData),
        {
          fallbackMessage: this.fallbackFor(StoreOperation.createOne),
        }
      );
      toast.success("Invoice created successfully");
      return responseData.id;
    } catch (err) {
      const fallback = this.fallbackFor(StoreOperation.createOne);
      const errorMessage = getErrorMessage(err, fallback);
      console.error("Error creating invoice:", err);
      toast.error(errorMessage);
      return null;
    }
  }
}
