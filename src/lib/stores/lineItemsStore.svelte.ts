import { client } from "$lib/client";
import type { LineItem } from "$lib/db/schema";
import type { CursorId, List, Maybe } from "$lib/types";
import type {
  Key,
  LineItemUpdate,
  NewLineItemWithId,
  NormalizedLineItem,
} from "$lib/types/invoiceLineItems";
import type { LineItemSelect } from "$lib/validators";
import { toast } from "svelte-sonner";

export class LineItemsStore {
  // Use $state for reactive class fields
  lineItems = $state<LineItemSelect[]>([]);
  loading = $state(false);
  error = $state<Maybe<string>>(null);

  // Use $derived for computed values
  isLoaded = $derived(this.lineItems.length > 0 || this.error !== null);

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
    try {
      const { data: lineItemsData } = await client.api
        .invoices({ id: invoiceId })
        [
          "line-items"
        ].get(options?.signal ? { fetch: { signal: options.signal } } : undefined);
      if (
        !lineItemsData ||
        (typeof lineItemsData === "object" && "error" in lineItemsData)
      ) {
        throw new Error(lineItemsData?.error || "Failed to load line items");
      }

      return lineItemsData;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return null;
      }
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load line items";
      console.error("Error loading line items:", err);
      toast.error(errorMessage);
      return null;
    } finally {
      this.loading = false;
    }
  }

  // Load all line items (for admin purposes)
  async loadAllLineItems() {
    this.loading = true;
    this.error = null;

    try {
      const { data: lineItemsData } = await client.api["line-items"].get();
      if (
        !lineItemsData ||
        (typeof lineItemsData === "object" && "error" in lineItemsData)
      ) {
        throw new Error(lineItemsData?.error || "Failed to load line items");
      }

      // Update the reactive state
      this.lineItems.length = 0;
      this.lineItems.push(...lineItemsData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load line items";
      this.error = errorMessage;
      console.error("Error loading line items:", err);
      toast.error(errorMessage);
    } finally {
      this.loading = false;
    }
  }

  normalizeLineItems(
    items: Array<LineItem | NewLineItemWithId>,
    userId: string,
    invoiceId: CursorId
  ): Array<NormalizedLineItem> {
    if (items.length === 0) return [];
    return items.reduce<Array<NormalizedLineItem>>((acc, item) => {
      if ((item.description?.trim() ?? "").length > 0) {
        acc.push({
          ...item,
          userId,
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
    try {
      const { data: lineItemsData } = await client.api
        .invoices({ id: invoiceId })
        ["line-items"].post({ lineItems: items });
      if (
        !lineItemsData ||
        (typeof lineItemsData === "object" && "error" in lineItemsData)
      ) {
        throw new Error(lineItemsData?.error || "Failed to create line items");
      }

      toast.success("Line items created successfully");
      return lineItemsData;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create line items";
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
    try {
      const { data: lineItemsData } = await client.api
        .invoices({ id: invoiceId })
        ["line-items"].put({ lineItems: items });
      if (
        !lineItemsData ||
        (typeof lineItemsData === "object" && "error" in lineItemsData)
      ) {
        throw new Error(lineItemsData?.error || "Failed to update line items");
      }

      toast.success("Line items updated successfully");
      return lineItemsData;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update line items";
      console.error("Error updating line items:", err);
      toast.error(errorMessage);
      return null;
    }
  }

  // Delete a line item
  async deleteLineItem(lineItemId: Key) {
    try {
      const { data } = await client.api["line-items"]({
        id: lineItemId,
      }).delete();
      if (data && typeof data === "object" && "error" in data) {
        throw new Error(data.error || "Failed to delete line item");
      }

      // Remove from local state
      const index = this.lineItems.findIndex((item) => item.id === lineItemId);
      if (index !== -1) {
        this.lineItems.splice(index, 1);
      }

      toast.success("Line item deleted successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete line item";
      console.error("Error deleting line item:", err);
      toast.error(errorMessage);
    }
  }

  // Reset store
  resetLineItems() {
    this.lineItems.length = 0;
    this.loading = false;
    this.error = null;
  }
}
