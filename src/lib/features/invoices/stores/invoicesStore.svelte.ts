import { client } from "$lib/client";
import type { CursorPaginatedList } from "$lib/features/pagination/types";
import { CursorPaginatedListStoreBase } from "$lib/stores/cursor-paginated-base.svelte";
import type { CursorId, Maybe } from "$lib/types";
import { today } from "$lib/utils/dateHelpers";
import {
  StoreOperation,
  getErrorMessage,
  isAbortError,
} from "$lib/utils/error-message";
import { unwrapTreaty, unwrapTreatyResult } from "$lib/utils/unwrap";
import { toast } from "svelte-sonner";
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
      invoiceNumber: "",
      subject: "",
      discount: 0,
      issueDate: today,
      dueDate: today,
      notes: null,
      terms: null,
      invoiceStatus: "draft",
    };
  }

  protected async fetchList(
    query: Record<string, string>,
    signal: AbortSignal
  ): Promise<CursorPaginatedList<InvoiceListResponse>> {
    return unwrapTreatyResult(
      await client.api.invoices.get({
        query,
        fetch: { signal },
      }),
      { fallbackMessage: this.fallbackFor(StoreOperation.loadMany) }
    );
  }

  async loadInvoiceById(id: string): Promise<Maybe<InvoiceSelect>> {
    const fallback = this.fallbackFor(StoreOperation.loadOne);
    try {
      return await unwrapTreaty(client.api.invoices({ id }).get(), {
        fallbackMessage: fallback,
      });
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

  async deleteInvoice(invoiceId: string) {
    const fallback = this.fallbackFor(StoreOperation.deleteOne);
    try {
      await unwrapTreaty(client.api.invoices({ id: invoiceId }).delete(), {
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
        client.api.invoices({ id }).patch(patch),
        { fallbackMessage: this.fallbackFor(StoreOperation.updateOne) }
      );
      toast.success("Invoice updated successfully");
      const index = this.items.findIndex(
        (invoice) => invoice.id === responseData.id
      );
      if (index !== -1) {
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
        client.api.invoices.post(invoiceData),
        { fallbackMessage: this.fallbackFor(StoreOperation.createOne) }
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
