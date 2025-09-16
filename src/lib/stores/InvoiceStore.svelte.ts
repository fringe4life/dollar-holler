import type { Client, Invoice, LineItem } from "$lib/db/schema";
import { toast } from "svelte-sonner";

// Extended types for the store
interface InvoiceWithRelations extends Invoice {
	client: Client;
	lineItems: LineItem[];
}

// Create reactive state using $state
export const invoices = $state<InvoiceWithRelations[]>([]);

// Export getter function to access invoices
export function getInvoices() {
	return invoices;
}

export const loadInvoices = async () => {
	try {
		const response = await fetch('/api/invoices');
		if (!response.ok) {
			throw new Error('Failed to load invoices');
		}
		const transformedInvoices = await response.json();
		
		// Update the reactive state
		invoices.length = 0;
		invoices.push(...transformedInvoices);
	} catch (error) {
		console.error("Error loading invoices:", error);
	}
};

export const deleteInvoice = async (invoice: Invoice) => {
	try {
		const response = await fetch(`/api/invoices/${invoice.id}`, {
			method: 'DELETE'
		});
		
		if (!response.ok) {
			throw new Error('Failed to delete invoice');
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

export const addInvoice = async (invoiceToAdd: InvoiceWithRelations) => {
	try {
		const response = await fetch('/api/invoices', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(invoiceToAdd)
		});
		
		if (!response.ok) {
			throw new Error('Failed to add invoice');
		}
		
		const { id } = await response.json();
		
		// Update the reactive state
		const newInvoiceWithId = { ...invoiceToAdd, id };
		invoices.push(newInvoiceWithId);
		return newInvoiceWithId;
	} catch (error) {
		console.error("Error adding invoice:", error);
		toast.error("Failed to add invoice");
	}
};

export const updateInvoice = async (invoiceToUpdate: InvoiceWithRelations) => {
	try {
		const response = await fetch(`/api/invoices/${invoiceToUpdate.id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(invoiceToUpdate)
		});
		
		if (!response.ok) {
			throw new Error('Failed to update invoice');
		}

		// Update the reactive state
		const index = invoices.findIndex((i) => i.id === invoiceToUpdate.id);
		if (index !== -1) {
			invoices[index] = invoiceToUpdate;
		}
		toast.success("Invoice Updated");
		return invoiceToUpdate;
	} catch (error) {
		console.error("Error updating invoice:", error);
		toast.error("Failed to update invoice");
	}
};

export const getInvoiceById = async (
	id: string,
): Promise<InvoiceWithRelations | undefined> => {
	try {
		const response = await fetch(`/api/invoices/${id}`);
		if (!response.ok) {
			return undefined;
		}
		return await response.json();
	} catch (error) {
		console.error("Error getting invoice by ID:", error);
		return undefined;
	}
};
