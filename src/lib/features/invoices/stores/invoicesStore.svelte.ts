import { client } from "$lib/client";
import type { CursorPaginatedList } from "$lib/features/pagination/types";
import { CursorPaginatedListStoreBase } from "$lib/stores/cursor-paginated-base.svelte";
import type { CursorId, List, Maybe } from "$lib/types";
import {
  StoreOperation,
  getErrorMessage,
  isAbortError,
} from "$lib/utils/error-message";
import { transformNullToUndefined } from "$lib/utils/typeHelpers";
import { unwrapTreaty, unwrapTreatyResult } from "$lib/utils/unwrap";
import { toast } from "svelte-sonner";
import type {
  InvoiceInsert,
  InvoiceListResponse,
  InvoiceSelect,
} from "../types";

export class InvoicesStore extends CursorPaginatedListStoreBase<InvoiceListResponse> {
  protected readonly resourceSingular = "invoice";
  protected readonly resourcePlural = "invoices";

  newInvoice(): Omit<InvoiceInsert, "clientId"> & {
    clientId: CursorId | undefined;
  } {
    return {
      clientId: undefined,
      invoiceNumber: "",
      subject: null,
      issueDate: new Date(),
      dueDate: new Date(),
      discount: null,
      notes: null,
      terms: null,
      invoiceStatus: "draft",
      userId: "",
    };
  }

  normalizeInvoice(
    invoice: InvoiceInsert,
    discount: number = 0,
    userId: string
  ): InvoiceInsert {
    return {
      ...invoice,
      issueDate: new Date(invoice.issueDate),
      dueDate: new Date(invoice.dueDate),
      discount,
      userId,
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
    } catch (error_) {
      if (isAbortError(error_)) {
        return null;
      }
      const errorMessage = getErrorMessage(error_, fallback);
      console.error("Error loading invoice:", error_);
      toast.error(errorMessage);
      return null;
    }
  }

  async getInvoicesByClientId(
    clientId: string
  ): Promise<List<InvoiceListResponse>> {
    this.loading = true;
    this.error = null;
    const fallback = "Failed to load client invoices";
    try {
      return await unwrapTreaty(
        client.api.clients({ id: clientId }).invoices.get(),
        { fallbackMessage: fallback }
      );
    } catch (error_) {
      if (isAbortError(error_)) {
        return null;
      }
      const errorMessage = getErrorMessage(error_, fallback);
      console.error("Error loading client invoices:", error_);
      toast.error(errorMessage);
      return null;
    } finally {
      this.loading = false;
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
    } catch (error_) {
      const errorMessage = getErrorMessage(error_, fallback);
      console.error("Error deleting invoice:", error_);
      toast.error(errorMessage);
    }
  }

  async upsertInvoice(invoiceData: InvoiceInsert): Promise<Maybe<CursorId>> {
    try {
      const isUpdate = Boolean(invoiceData.id);
      const body = transformNullToUndefined(invoiceData);

      let responseData: InvoiceSelect | { id: CursorId };
      if (isUpdate && body.id) {
        responseData = await unwrapTreaty(
          client.api.invoices({ id: body.id }).put(body),
          { fallbackMessage: this.fallbackFor(StoreOperation.updateOne) }
        );
      } else {
        responseData = await unwrapTreaty(client.api.invoices.post(body), {
          fallbackMessage: this.fallbackFor(StoreOperation.createOne),
        });
      }

      if (isUpdate && body.id) {
        const index = this.items.findIndex((index_) => index_.id === body.id);
        if (index !== -1) {
          this.items[index] = {
            ...this.items[index],
            ...body,
            updatedAt: new Date(),
          };
        }
        toast.success("Invoice updated successfully");
        return body.id;
      }
      const { id } = responseData;
      toast.success("Invoice created successfully");
      return id;
    } catch (error_) {
      const isUpdate = Boolean(invoiceData.id);
      const fallback = this.fallbackFor(
        isUpdate ? StoreOperation.updateOne : StoreOperation.createOne
      );
      const errorMessage = getErrorMessage(error_, fallback);
      console.error(
        `Error ${isUpdate ? "updating" : "creating"} invoice:`,
        error_
      );
      toast.error(errorMessage);
      return null;
    }
  }
}
