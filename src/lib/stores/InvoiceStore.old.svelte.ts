import type { NewInvoice } from "$lib/db/schema";
import {
  normalizeToNull,
  transformNullToUndefined,
} from "$lib/utils/typeHelpers";
import type { InvoiceWithRelationsResponse } from "$lib/validators";
import { invoiceWithRelationsResponseSchema } from "$lib/validators";
import { ArkErrors } from "arktype";
import { toast } from "svelte-sonner";

// Create reactive state using $state
export const invoices = $state<InvoiceWithRelationsResponse[]>([]);

// Export getter function to access invoices
export function getInvoices() {
  return invoices;
}

export const loadInvoices = async () => {
  try {
    const response = await fetch("/api/invoices");
    if (!response.ok) {
      throw new Error("Failed to load invoices");
    }
    const rawData = await response.json();

    // Validate response with ArkType
    const validationResult =
      invoiceWithRelationsResponseSchema.array()(rawData);
    if (validationResult instanceof ArkErrors) {
      console.error("Invalid invoice data received:", validationResult.summary);
      throw new Error("Invalid invoice data received from server");
    }

    // Update the reactive state
    invoices.length = 0;
    invoices.push(...validationResult);
  } catch (error) {
    console.error("Error loading invoices:", error);
    toast.error("Failed to load invoices");
  }
};

export const deleteInvoice = async (invoice: NewInvoice) => {
  try {
    const response = await fetch(`/api/invoices/${invoice.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete invoice");
    }

    // Update the reactive state
    const index = invoices.findIndex((i) => i.id === invoice.id);
    if (index !== -1) {
      invoices.splice(index, 1);
    }
    toast.success("Successfully deleted your invoice");
    return invoice;
  } catch (error) {
    console.error("Error deleting invoice:", error);
    toast.error("Failed to delete invoice");
  }
};

// Upsert function that handles both create and update
export const upsertInvoice = async (invoiceData: NewInvoice) => {
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
      throw new Error(`Failed to ${isUpdate ? "update" : "add"} invoice`);
    }

    if (isUpdate && invoiceData.id) {
      // Update existing invoice in state
      const index = invoices.findIndex((i) => i.id === invoiceData.id);
      if (index !== -1) {
        invoices[index] = {
          ...invoices[index],
          ...invoiceData,
          id: invoiceData.id, // Ensure id is string, not undefined
          createdAt: invoices[index].createdAt, // Preserve original createdAt
          updatedAt: new Date(), // Update the timestamp
          // Normalize undefined to null for consistent null handling
          subject: normalizeToNull(invoiceData.subject),
          discount: normalizeToNull(invoiceData.discount),
          notes: normalizeToNull(invoiceData.notes),
          terms: normalizeToNull(invoiceData.terms),
          invoiceStatus: normalizeToNull(invoiceData.invoiceStatus),
          // Preserve relations if they exist
          client: invoices[index].client,
          lineItems: invoices[index].lineItems,
        };
      }
      toast.success("Invoice Updated");
      return invoiceData.id;
    } else {
      // Add new invoice to state
      const { id } = await response.json();
      const newInvoice: InvoiceWithRelationsResponse = {
        ...invoiceData,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Normalize undefined to null for consistent null handling
        subject: normalizeToNull(invoiceData.subject),
        discount: normalizeToNull(invoiceData.discount),
        notes: normalizeToNull(invoiceData.notes),
        terms: normalizeToNull(invoiceData.terms),
        invoiceStatus: normalizeToNull(invoiceData.invoiceStatus),
        client: {} as any, // Will be populated by the API
        lineItems: [],
      };
      invoices.push(newInvoice);
      toast.success("Invoice Created");
      return id;
    }
  } catch (error) {
    const isUpdate = !!invoiceData.id;
    console.error(`Error ${isUpdate ? "updating" : "adding"} invoice:`, error);
    toast.error(`Failed to ${isUpdate ? "update" : "add"} invoice`);
  }
};

export const getInvoiceById = async (
  id: string,
): Promise<InvoiceWithRelationsResponse | undefined> => {
  try {
    const response = await fetch(`/api/invoices/${id}`);
    if (!response.ok) {
      return undefined;
    }
    const rawData = await response.json();

    // Validate response with ArkType
    const validationResult = invoiceWithRelationsResponseSchema(rawData);
    if (validationResult instanceof ArkErrors) {
      console.error("Invalid invoice data received:", validationResult.summary);
      return undefined;
    }

    return validationResult;
  } catch (error) {
    console.error("Error getting invoice by ID:", error);
    return undefined;
  }
};
