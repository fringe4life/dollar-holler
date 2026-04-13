import { client } from "$lib/client";
import type { LineItem } from "$lib/db/schema";
import type {
  Key,
  LineItemUpdate,
  NewLineItemWithId,
  NormalizedLineItem,
} from "$lib/features/line-items/types";
import type { CursorId, List } from "$lib/types";
import {
  StoreOperation,
  getErrorMessage,
  isAbortError,
} from "$lib/utils/error-message";
import { unwrapTreaty, unwrapTreatyResult } from "$lib/utils/unwrap";
import { toast } from "svelte-sonner";
import { StoreResourceErrorBase } from "../../../stores/store-resource-error-base.svelte";
import type { LineItemSelect } from "../types";

export class LineItemsStore extends StoreResourceErrorBase<LineItemSelect> {
  protected readonly resourceSingular = "line item";
  protected readonly resourcePlural = "line items";
  /** Immutable update of one row in a local line-items array (e.g. InvoiceForm). */
  patchLineItem(
    items: Array<LineItem | NewLineItemWithId>,
    id: CursorId | number,
    patch: LineItemUpdate
  ): Array<LineItem | NewLineItemWithId> {
    return items.map((item) => {
      if (item.id !== id) return item;
      return { ...item, ...patch, updatedAt: new Date() };
    });
  }

  /** Line amount from quantity × unit price. */
  amountFromUnitPrice(quantity: number, unitPrice: number): number {
    return quantity * unitPrice;
  }

  /** Returns a blank LineItem for form rows (new id and timestamps each call). */
  newLineItem({
    id,
    invoiceId,
  }: {
    id: number;
    invoiceId?: CursorId;
  }): NewLineItemWithId {
    const now = new Date();
    return {
      id,
      createdAt: now,
      updatedAt: now,
      userId: "",
      description: "",
      invoiceId,
      quantity: 0,
      amount: 0,
    };
  }

  // Load line items for a specific invoice
  async loadLineItemsByInvoiceId(
    invoiceId: string,
    options?: { signal?: AbortSignal }
  ): Promise<List<LineItemSelect>> {
    this.loading = true;
    this.error = null;
    const fallback = this.fallbackFor(StoreOperation.loadMany);
    try {
      return await unwrapTreaty(
        client.api
          .invoices({ id: invoiceId })
          [
            "line-items"
          ].get(options?.signal ? { fetch: { signal: options.signal } } : undefined),
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
    items: Array<LineItem | NewLineItemWithId>,
    invoiceId: CursorId
  ): Array<NormalizedLineItem> {
    if (items.length === 0) return [];
    return items.reduce<Array<NormalizedLineItem>>((acc, item) => {
      if ((item.description?.trim() ?? "").length > 0) {
        acc.push({
          ...item,
          id: typeof item.id === "number" ? undefined : item.id,
          invoiceId,
        });
      }
      return acc;
    }, []);
  }
  // Create line items for an invoice
  async createLineItems(
    invoiceId: CursorId,
    items: Array<NormalizedLineItem>
  ): Promise<List<LineItemSelect>> {
    const fallback = this.fallbackFor(StoreOperation.createMany);
    const body = items.map((item) => ({
      ...item,
      invoiceId,
    }));
    try {
      const lineItemsData = await unwrapTreaty(
        client.api.invoices({ id: invoiceId })["line-items"].post({
          lineItems: body,
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
    items: Array<NormalizedLineItem>
  ): Promise<List<LineItemSelect>> {
    const fallback = this.fallbackFor(StoreOperation.updateMany);
    try {
      const lineItemsData = await unwrapTreaty(
        client.api.invoices({ id: invoiceId })["line-items"].put({
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
    const fallback = this.fallbackFor(StoreOperation.deleteOne);
    try {
      unwrapTreatyResult(
        await client.api["line-items"]({
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
