import type { Client, ClientStatus, Invoice } from "$lib/db/schema";
import { toast } from "svelte-sonner";

// Extended Client type with invoices
interface ClientWithInvoices extends Client {
	invoice?: Invoice[];
}

// Create reactive state using $state
export const clients = $state<ClientWithInvoices[]>([]);

// Export getter function to access clients
export function getClients() {
	return clients;
}

// Export a reactive reference that can be used in components
export const clientsStore = {
	get value() {
		return clients;
	},
};

export const loadClients = async () => {
	try {
		const response = await fetch('/api/clients');
		if (!response.ok) {
			throw new Error('Failed to load clients');
		}
		const transformedClients = await response.json();
		
		// Update the reactive state
		clients.length = 0;
		clients.push(...transformedClients);
	} catch (error) {
		console.error("Error loading clients:", error);
	}
};

export const addClient = async (clientToAdd: Omit<Client, "id">) => {
	try {
		const response = await fetch('/api/clients', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(clientToAdd)
		});
		
		if (!response.ok) {
			throw new Error('Failed to add client');
		}
		
		const { id } = await response.json();
		const newClient: ClientWithInvoices = {
			...clientToAdd,
			id,
			clientStatus: "active" as ClientStatus,
		};

		// Update the reactive state
		clients.push(newClient);
		return id;
	} catch (error) {
		console.error("Error adding client:", error);
		toast.error("Failed to add client");
	}
};

export const updateClient = async (clientToUpdate: ClientWithInvoices) => {
	try {
		const response = await fetch(`/api/clients/${clientToUpdate.id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(clientToUpdate)
		});
		
		if (!response.ok) {
			throw new Error('Failed to update client');
		}

		// Update the reactive state
		const index = clients.findIndex((c) => c.id === clientToUpdate.id);
		if (index !== -1) {
			clients[index] = clientToUpdate;
		}
		return clientToUpdate;
	} catch (error) {
		console.error("Error updating client:", error);
		toast.error("Failed to update client");
	}
};

export const getClientById = async (
	id: string,
): Promise<ClientWithInvoices | undefined> => {
	try {
		const response = await fetch(`/api/clients/${id}`);
		if (!response.ok) {
			return undefined;
		}
		return await response.json();
	} catch (error) {
		console.error("Error getting client by ID:", error);
		return undefined;
	}
};

export const deleteClient = async (clientToDelete: ClientWithInvoices) => {
	try {
		const response = await fetch(`/api/clients/${clientToDelete.id}`, {
			method: 'DELETE'
		});
		
		if (!response.ok) {
			throw new Error('Failed to delete client');
		}

		// Update the reactive state
		const index = clients.findIndex((c) => c.id === clientToDelete.id);
		if (index !== -1) {
			clients.splice(index, 1);
		}
	} catch (error) {
		console.error("Error deleting client:", error);
		toast.error("Failed to delete client");
	}
};
