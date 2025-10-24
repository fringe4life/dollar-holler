import { normalizeToNull, transformNullToUndefined } from "$lib/utils/typeHelpers";
import type { InvoiceSelect, NewInvoice } from "$lib/validators";
import { invoiceSelectWithDatesSchema } from "$lib/validators";
import { ArkErrors } from "arktype";
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
      const response = await fetch("/api/invoices");
      if (!response.ok) {
        throw new Error("Failed to load invoices");
      }
      const rawData = await response.json();

      // Validate response with ArkType
      const validationResult = invoiceSelectWithDatesSchema.array()(rawData);
      if (validationResult instanceof ArkErrors) {
        console.error("Invalid invoice data received:", validationResult.summary);
        throw new Error("Invalid invoice data received from server");
      }

      // Update the reactive state
      this.invoices.length = 0;
      this.invoices.push(...validationResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load invoices";
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
      const response = await fetch(`/api/invoices/${id}`);
      if (!response.ok) {
        throw new Error("Failed to load invoice");
      }
      const rawData = await response.json();

      // Validate response with ArkType
      const validationResult = invoiceSelectWithDatesSchema(rawData);
      if (validationResult instanceof ArkErrors) {
        console.error("Invalid invoice data received:", validationResult.summary);
        throw new Error("Invalid invoice data received from server");
      }

      return validationResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load invoice";
      console.error("Error loading invoice:", err);
      toast.error(errorMessage);
      return null;
    }
  }

  // Get invoices for a specific client
  async getInvoicesByClientId(clientId: string): Promise<InvoiceSelect[]> {
    try {
      const response = await fetch(`/api/clients/${clientId}/invoices`);
      if (!response.ok) {
        throw new Error("Failed to load client invoices");
      }
      const rawData = await response.json();

      // Validate response with ArkType
      const validationResult = invoiceSelectWithDatesSchema.array()(rawData);
      if (validationResult instanceof ArkErrors) {
        console.error("Invalid invoice data received:", validationResult.summary);
        throw new Error("Invalid invoice data received from server");
      }

      return validationResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load client invoices";
      console.error("Error loading client invoices:", err);
      toast.error(errorMessage);
      return [];
    }
  }

  // Delete invoice
  async deleteInvoice(invoiceId: string) {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete invoice");
      }

      // Remove from local state
      const index = this.invoices.findIndex((invoice) => invoice.id === invoiceId);
      if (index !== -1) {
        this.invoices.splice(index, 1);
      }

      toast.success("Invoice deleted successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete invoice";
      console.error("Error deleting invoice:", err);
      toast.error(errorMessage);
    }
  }

  // Upsert invoice (create or update)
  async upsertInvoice(invoiceData: NewInvoice): Promise<string | null> {
    try {
      const isUpdate = !!invoiceData.id;
      const url = isUpdate ? `/api/invoices/${invoiceData.id}` : "/api/invoices";
      const method = isUpdate ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transformNullToUndefined(invoiceData)),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isUpdate ? "update" : "create"} invoice`);
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
        const { id } = await response.json();
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
        this.invoices.push(newInvoice);
        toast.success("Invoice created successfully");
        return id;
      }
    } catch (err) {
      const isUpdate = !!invoiceData.id;
      const errorMessage = err instanceof Error ? err.message : `Failed to ${isUpdate ? "update" : "create"} invoice`;
      console.error(`Error ${isUpdate ? "updating" : "creating"} invoice:`, err);
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

// Export convenience methods for backward compatibility
export const { invoices, loading, error, isLoaded, loadInvoices, loadInvoiceById, getInvoicesByClientId, deleteInvoice, upsertInvoice, resetInvoices } = invoicesStore;