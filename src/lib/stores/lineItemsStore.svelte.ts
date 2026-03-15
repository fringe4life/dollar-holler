import { client } from "$lib/client";
import type { LineItem } from "$lib/db/schema";
import type { List, Maybe } from "$lib/types";
import type { LineItemSelect, NewLineItem } from "$lib/validators";
import { toast } from "svelte-sonner";

class LineItemsStore {
  // Use $state for reactive class fields
  lineItems = $state<LineItemSelect[]>([]);
  loading = $state(false);
  error = $state<Maybe<string>>(null);

  // Use $derived for computed values
  isLoaded = $derived(this.lineItems.length > 0 || this.error !== null);

  /** Returns a blank LineItem for form rows (new id and timestamps each call). */
  newLineItem(): LineItem {
    const now = new Date();
    return {
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      userId: "",
      description: "",
      invoiceId: "",
      quantity: 0,
      amount: 0,
    };
  }

  // Load line items for a specific invoice
  async loadLineItemsByInvoiceId(
    invoiceId: string
  ): Promise<List<LineItemSelect>> {
    this.loading = true;
    this.error = null;
    try {
      const { data: lineItemsData } = await client.api
        .invoices({ id: invoiceId })
        ["line-items"].get();
      if (
        !lineItemsData ||
        (typeof lineItemsData === "object" && "error" in lineItemsData)
      ) {
        throw new Error(lineItemsData?.error || "Failed to load line items");
      }

      return lineItemsData;
    } catch (err) {
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

  // Create line items for an invoice
  async createLineItems(
    invoiceId: string,
    items: NewLineItem[]
  ): Promise<List<LineItemSelect>> {
    try {
      // Map to only include fields expected by the API schema
      const body = items.map((item) => ({
        id: item.id,
        userId: item.userId,
        description: item.description,
        quantity: item.quantity ?? 0,
        amount: item.amount,
      }));
      const { data: lineItemsData } = await client.api
        .invoices({ id: invoiceId })
        ["line-items"].post(body);
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
    invoiceId: string,
    items: NewLineItem[]
  ): Promise<List<LineItemSelect>> {
    try {
      // Map to only include fields expected by the API schema
      const body = items.map((item) => ({
        id: item.id,
        userId: item.userId,
        description: item.description,
        quantity: item.quantity ?? 0,
        amount: item.amount,
      }));
      const { data: lineItemsData } = await client.api
        .invoices({ id: invoiceId })
        ["line-items"].put(body);
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
  async deleteLineItem(lineItemId: string) {
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

// Create and export a singleton instance
export const lineItemsStore = new LineItemsStore();

// Export store instance and reactive properties
export const { lineItems, loading, error, isLoaded } = lineItemsStore;
