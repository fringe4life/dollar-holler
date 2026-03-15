import { client } from "$lib/client";
import type { List, Maybe } from "$lib/types";
import {
  normalizeToNull,
  transformNullToUndefined,
} from "$lib/utils/typeHelpers";
import type {
  InvoiceListResponse,
  InvoiceSelect,
  NewInvoice,
} from "$lib/validators";
import { toast } from "svelte-sonner";

class InvoicesStore {
  // Use $state for reactive class fields
  invoices = $state<InvoiceListResponse[]>([]);
  loading = $state(false);
  error = $state<Maybe<string>>(null);

  // Use $derived for computed values
  isLoaded = $derived(this.invoices.length > 0 || this.error !== null);

  /** Returns a blank NewInvoice for forms (create mode). */
  newInvoice(): NewInvoice {
    return {
      clientId: "",
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

  // Load all invoices (with client name and total)
  async loadInvoices() {
    this.loading = true;
    this.error = null;

    try {
      const { data: invoiceData } = await client.api.invoices.get();
      if (
        !invoiceData ||
        (typeof invoiceData === "object" && "error" in invoiceData)
      ) {
        throw new Error(
          (invoiceData as { error?: string })?.error ||
            "Failed to load invoices"
        );
      }

      // Update the reactive state
      this.invoices.length = 0;
      this.invoices.push(...invoiceData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load invoices";
      this.error = errorMessage;
      console.error("Error loading invoices:", error);
      toast.error(errorMessage);
    } finally {
      this.loading = false;
    }
  }

  // Load a single invoice by ID (without relations)
  async loadInvoiceById(id: string): Promise<Maybe<InvoiceSelect>> {
    try {
      const { data: invoiceData, error } = await client.api
        .invoices({ id })
        .get();
      if (
        !invoiceData ||
        error ||
        (typeof invoiceData === "object" && "error" in invoiceData)
      ) {
        const errorMessage =
          error?.value === "Unauthorized"
            ? "Unauthorized"
            : error?.value?.message || "Failed to load invoice";
        throw new Error(errorMessage);
      }

      return invoiceData;
    } catch (error_) {
      const errorMessage =
        error_ instanceof Error ? error_.message : "Failed to load invoice";
      console.error("Error loading invoice:", error_);
      toast.error(errorMessage);
      return null;
    }
  }

  // Get invoices for a specific client (with total)
  async getInvoicesByClientId(
    clientId: string
  ): Promise<List<InvoiceListResponse>> {
    this.loading = true;
    this.error = null;
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
    } catch (error_) {
      const errorMessage =
        error_ instanceof Error
          ? error_.message
          : "Failed to load client invoices";
      console.error("Error loading client invoices:", error_);
      toast.error(errorMessage);
      return null;
    } finally {
      this.loading = false;
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
    } catch (error_) {
      const errorMessage =
        error_ instanceof Error ? error_.message : "Failed to delete invoice";
      console.error("Error deleting invoice:", error_);
      toast.error(errorMessage);
    }
  }

  // Upsert invoice (create or update)
  async upsertInvoice(invoiceData: NewInvoice): Promise<Maybe<string>> {
    try {
      const isUpdate = Boolean(invoiceData.id);
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
        const index = this.invoices.findIndex(
          (index_) => index_.id === invoiceData.id
        );
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
      }
      // Add new invoice to state - form will call loadInvoices after line items are created
      const { id } = responseData as { id: string };
      toast.success("Invoice created successfully");
      return id;
    } catch (error_) {
      const isUpdate = Boolean(invoiceData.id);
      const errorMessage =
        error_ instanceof Error
          ? error_.message
          : `Failed to ${isUpdate ? "update" : "create"} invoice`;
      console.error(
        `Error ${isUpdate ? "updating" : "creating"} invoice:`,
        error_
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
