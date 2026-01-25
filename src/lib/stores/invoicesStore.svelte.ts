import { client } from "$lib/client";
import {
  normalizeToNull,
  transformNullToUndefined,
} from "$lib/utils/typeHelpers";
import type { InvoiceSelect, NewInvoice } from "$lib/validators";
import { toast } from "svelte-sonner";

class InvoicesStore {
  // Use $state for reactive class fields
  invoices = $state<InvoiceSelect[]>([]);
  loading = $state(false);
  error = $state<string | null>(null);

  // Use $derived for computed values
  isLoaded = $derived(this.invoices.length > 0 || this.error !== null);

  // Load all invoices (without relations)
  async loadInvoices() {
    this.loading = true;
    this.error = null;

    try {
      const { data: invoiceData } = await client.api.invoices.get();
      if (
        !invoiceData ||
        (typeof invoiceData === "object" && "error" in invoiceData)
      ) {
        throw new Error(invoiceData?.error || "Failed to load invoices");
      }

      // Update the reactive state
      this.invoices.length = 0;
      this.invoices.push(...invoiceData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load invoices";
      this.error = errorMessage;
      console.error("Error loading invoices:", err);
      toast.error(errorMessage);
    } finally {
      this.loading = false;
    }
  }

  // Load a single invoice by ID (without relations)
  async loadInvoiceById(id: string): Promise<InvoiceSelect | null> {
    try {
      const { data: invoiceData } = await client.api.invoices({ id }).get();
      if (
        !invoiceData ||
        (typeof invoiceData === "object" && "error" in invoiceData)
      ) {
        throw new Error(invoiceData?.error || "Failed to load invoice");
      }

      return invoiceData;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load invoice";
      console.error("Error loading invoice:", err);
      toast.error(errorMessage);
      return null;
    }
  }

  // Get invoices for a specific client
  async getInvoicesByClientId(clientId: string): Promise<InvoiceSelect[]> {
    try {
      const { data: invoiceData } = await client.api
        .clients({ id: clientId })
        .invoices.get();
      if (
        !invoiceData ||
        (typeof invoiceData === "object" && "error" in invoiceData)
      ) {
        throw new Error(invoiceData?.error || "Failed to load client invoices");
      }

      return invoiceData;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load client invoices";
      console.error("Error loading client invoices:", err);
      toast.error(errorMessage);
      return [];
    }
  }

  // Delete invoice
  async deleteInvoice(invoiceId: string) {
    try {
      const { data } = await client.api.invoices({ id: invoiceId }).delete();
      if (data && typeof data === "object" && "error" in data) {
        throw new Error(data.error || "Failed to delete invoice");
      }

      // Remove from local state
      const index = this.invoices.findIndex(
        (invoice) => invoice.id === invoiceId
      );
      if (index !== -1) {
        this.invoices.splice(index, 1);
      }

      toast.success("Invoice deleted successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete invoice";
      console.error("Error deleting invoice:", err);
      toast.error(errorMessage);
    }
  }

  // Upsert invoice (create or update)
  async upsertInvoice(invoiceData: NewInvoice): Promise<string | null> {
    try {
      const isUpdate = !!invoiceData.id;
      const body = transformNullToUndefined(invoiceData);

      let responseData: { id?: string; error?: string } | InvoiceSelect;
      if (isUpdate && invoiceData.id) {
        const { data } = await client.api.invoices({ id: invoiceData.id }).put({
          ...body,
          client: {
            id: invoiceData.clientId,
          },
        });
        if (!data || (typeof data === "object" && "error" in data)) {
          throw new Error(data?.error || "Failed to update invoice");
        }
        responseData = data;
      } else {
        const { data } = await client.api.invoices.post({
          ...body,
          client: {
            id: invoiceData.clientId,
          },
        });
        if (!data || (typeof data === "object" && "error" in data)) {
          throw new Error(data?.error || "Failed to create invoice");
        }
        responseData = data as { id: string };
      }

      if (isUpdate && invoiceData.id) {
        // Update existing invoice in state
        const index = this.invoices.findIndex((i) => i.id === invoiceData.id);
        if (index !== -1) {
          this.invoices[index] = {
            ...this.invoices[index],
            ...invoiceData,
            id: invoiceData.id,
            updatedAt: new Date(),
            subject: normalizeToNull(invoiceData.subject),
            discount: normalizeToNull(invoiceData.discount),
            notes: normalizeToNull(invoiceData.notes),
            terms: normalizeToNull(invoiceData.terms),
            invoiceStatus: normalizeToNull(invoiceData.invoiceStatus),
          };
        }
        toast.success("Invoice updated successfully");
        return invoiceData.id;
      } else {
        // Add new invoice to state
        const id = (responseData as { id: string }).id;
        const newInvoice: InvoiceSelect = {
          ...invoiceData,
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
          subject: normalizeToNull(invoiceData.subject),
          discount: normalizeToNull(invoiceData.discount),
          notes: normalizeToNull(invoiceData.notes),
          terms: normalizeToNull(invoiceData.terms),
          invoiceStatus: normalizeToNull(invoiceData.invoiceStatus),
        };
        this.invoices.unshift(newInvoice);
        toast.success("Invoice created successfully");
        return id;
      }
    } catch (err) {
      const isUpdate = !!invoiceData.id;
      const errorMessage =
        err instanceof Error
          ? err.message
          : `Failed to ${isUpdate ? "update" : "create"} invoice`;
      console.error(
        `Error ${isUpdate ? "updating" : "creating"} invoice:`,
        err
      );
      toast.error(errorMessage);
      return null;
    }
  }

  // Reset store
  resetInvoices() {
    this.invoices.length = 0;
    this.loading = false;
    this.error = null;
  }
}

// Create and export a singleton instance
export const invoicesStore = new InvoicesStore();

// Export store instance and reactive properties
export const { invoices, loading, error, isLoaded } = invoicesStore;
