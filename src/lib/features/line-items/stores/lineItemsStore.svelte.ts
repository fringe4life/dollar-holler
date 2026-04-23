import { toast } from "svelte-sonner";
import type {
  Key,
  LineItemInsert,
  NewLineItemWithId,
} from "$features/line-items/types";
import { apiClient } from "$lib/api";
import { StoreResourceErrorBase } from "$lib/stores/store-resource-error-base.svelte";
import type { CursorId, List } from "$lib/types";
import {
  getErrorMessage,
  isAbortError,
  StoreOperation,
} from "$lib/utils/error-message";
import { unwrapTreaty, unwrapTreatyResult } from "$lib/utils/unwrap";
import type { LineItemEditRow, UIKey } from "../types";

export class LineItemsStore extends StoreResourceErrorBase<LineItemEditRow> {
  protected readonly resourceSingular = "line item";
  protected readonly resourcePlural = "line items";

  /** Returns a blank LineItem for form rows (new id and timestamps each call). */
  newLineItem(id: UIKey): NewLineItemWithId {
    return {
      id,
      description: "",
      quantity: 0,
      amount: 0,
    };
  }

  // Load line items for a specific invoice
  async loadLineItemsByInvoiceId(
    invoiceId: string,
    options?: { signal?: AbortSignal }
  ): Promise<List<LineItemEditRow>> {
    this.loading = true;
    this.error = null;
    const fallback = this.fallbackFor(StoreOperation.loadMany);
    try {
      return await unwrapTreaty(
        apiClient
          .invoices({ id: invoiceId })
          ["line-items"].edit.get(
            options?.signal ? { fetch: { signal: options.signal } } : undefined
          ),
        { fallbackMessage: fallback }
      );
    } catch (err) {
      if (isAbortError(err)) {
        return null;
      }
      const errorMessage = getErrorMessage(err, fallback);
      console.error("Error loading line items:", err);
      toast.error(errorMessage);
      return null;
    } finally {
      this.loading = false;
    }
  }

  normalizeLineItems(
    items: (LineItemEditRow | NewLineItemWithId)[]
  ): LineItemInsert[] {
    if (items.length === 0) {
      return [];
    }
    return items.reduce<LineItemInsert[]>((acc, item) => {
      if ((item.description?.trim() ?? "").length > 0) {
        acc.push({
          ...item,
          id: typeof item.id === "number" ? undefined : item.id,
        });
      }
      return acc;
    }, []);
  }
  // Create line items for an invoice
  async createLineItems(
    invoiceId: CursorId,
    items: LineItemInsert[]
  ): Promise<List<LineItemEditRow>> {
    const fallback = this.fallbackFor(StoreOperation.createMany);

    try {
      const lineItemsData = await unwrapTreaty(
        apiClient.invoices({ id: invoiceId })["line-items"].post({
          lineItems: items,
        }),
        { fallbackMessage: fallback }
      );

      toast.success("Line items created successfully");
      return lineItemsData;
    } catch (err) {
      const errorMessage = getErrorMessage(err, fallback);
      console.error("Error creating line items:", err);
      toast.error(errorMessage);
      return null;
    }
  }

  // Update line items for an invoice (replace all)
  async updateLineItems(
    invoiceId: CursorId,
    items: LineItemInsert[]
  ): Promise<List<LineItemEditRow>> {
    const fallback = this.fallbackFor(StoreOperation.updateMany);
    try {
      const lineItemsData = await unwrapTreaty(
        apiClient.invoices({ id: invoiceId })["line-items"].put({
          lineItems: items,
        }),
        { fallbackMessage: fallback }
      );

      toast.success("Line items updated successfully");
      return lineItemsData;
    } catch (err) {
      const errorMessage = getErrorMessage(err, fallback);
      console.error("Error updating line items:", err);
      toast.error(errorMessage);
      return null;
    }
  }

  // Delete a line item
  async deleteLineItem(lineItemId: Key) {
    if (typeof lineItemId === "number") {
      return;
    }
    const fallback = this.fallbackFor(StoreOperation.deleteOne);
    try {
      unwrapTreatyResult(
        await apiClient["line-items"]({
          id: lineItemId,
        }).delete(),
        { fallbackMessage: fallback }
      );

      // Remove from local state
      const index = this.items.findIndex((item) => item.id === lineItemId);
      if (index !== -1) {
        this.items.splice(index, 1);
      }

      toast.success("Line item deleted successfully");
    } catch (err) {
      const errorMessage = getErrorMessage(err, fallback);
      console.error("Error deleting line item:", err);
      toast.error(errorMessage);
    }
  }

  resetLineItems() {
    this.resetLoadableListState();
  }
}
