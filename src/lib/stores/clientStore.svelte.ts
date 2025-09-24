/* eslint-disable svelte/prefer-svelte-reactivity */
import type { NewClient } from "$lib/db/schema";
import {
  normalizeToNull,
  transformNullToUndefined,
} from "$lib/utils/typeHelpers";
import type { ClientInsert, ClientWithInvoicesResponse } from "$lib/validators";
import { clientWithInvoicesResponseSchema } from "$lib/validators";
import { ArkErrors } from "arktype";
import { toast } from "svelte-sonner";

// Create reactive state using $state
export const clients = $state<ClientWithInvoicesResponse[]>([]);

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
    const response = await fetch("/api/clients");
    if (!response.ok) {
      throw new Error("Failed to load clients");
    }
    const rawData = await response.json();

    // Validate response with ArkType
    const validationResult = clientWithInvoicesResponseSchema.array()(rawData);
    if (validationResult instanceof ArkErrors) {
      console.error("Invalid client data received:", validationResult.summary);
      throw new Error("Invalid client data received from server");
    }

    // Update the reactive state
    clients.length = 0;
    clients.push(...validationResult);
  } catch (error) {
    console.error("Error loading clients:", error);
    toast.error("Failed to load clients");
  }
};

export const addClient = async (clientToAdd: Omit<ClientInsert, "id">) => {
  try {
    const response = await fetch("/api/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clientToAdd),
    });

    if (!response.ok) {
      throw new Error("Failed to add client");
    }

    const { id } = await response.json();
    const newClient: ClientWithInvoicesResponse = {
      ...clientToAdd,
      id,
      clientStatus: "active",
      invoices: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      // Ensure all required fields are present
      email: clientToAdd.email || null,
      street: clientToAdd.street || null,
      city: clientToAdd.city || null,
      state: clientToAdd.state || null,
      zip: clientToAdd.zip || null,
    };

    // Update the reactive state
    clients.push(newClient);
    return id;
  } catch (error) {
    console.error("Error adding client:", error);
    toast.error("Failed to add client");
  }
};

// Upsert function that handles both create and update
export const upsertClient = async (clientData: NewClient) => {
  try {
    const isUpdate = !!clientData.id;
    const url = isUpdate ? `/api/clients/${clientData.id}` : "/api/clients";
    const method = isUpdate ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transformNullToUndefined(clientData)),
    });

    if (!response.ok) {
      throw new Error(`Failed to ${isUpdate ? "update" : "add"} client`);
    }

    if (isUpdate && clientData.id) {
      // Update existing client in state
      const index = clients.findIndex((c) => c.id === clientData.id);
      if (index !== -1) {
        clients[index] = {
          ...clients[index],
          ...clientData,
          id: clientData.id, // Ensure id is string, not undefined
          invoices: clients[index].invoices, // Keep existing invoices
          createdAt: clients[index].createdAt, // Preserve original createdAt
          updatedAt: new Date(), // Update the timestamp
          // Normalize undefined to null for consistent null handling
          email: normalizeToNull(clientData.email),
          street: normalizeToNull(clientData.street),
          city: normalizeToNull(clientData.city),
          state: normalizeToNull(clientData.state),
          zip: normalizeToNull(clientData.zip),
          clientStatus: normalizeToNull(clientData.clientStatus),
        };
      }
      return clientData.id;
    } else {
      // Add new client to state
      const { id } = await response.json();
      const newClient: ClientWithInvoicesResponse = {
        ...clientData,
        id,
        invoices: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        // Normalize undefined to null for consistent null handling
        email: normalizeToNull(clientData.email),
        street: normalizeToNull(clientData.street),
        city: normalizeToNull(clientData.city),
        state: normalizeToNull(clientData.state),
        zip: normalizeToNull(clientData.zip),
        clientStatus: normalizeToNull(clientData.clientStatus),
      };
      clients.push(newClient);
      return id;
    }
  } catch (error) {
    const isUpdate = !!clientData.id;
    console.error(`Error ${isUpdate ? "updating" : "adding"} client:`, error);
    toast.error(`Failed to ${isUpdate ? "update" : "add"} client`);
  }
};

export const getClientById = async (
  id: string,
): Promise<ClientWithInvoicesResponse | undefined> => {
  try {
    const response = await fetch(`/api/clients/${id}`);
    if (!response.ok) {
      return undefined;
    }
    const rawData = await response.json();

    // Validate response with ArkType
    const validationResult = clientWithInvoicesResponseSchema(rawData);
    if (validationResult instanceof ArkErrors) {
      console.error("Invalid client data received:", validationResult.summary);
      return undefined;
    }

    return validationResult;
  } catch (error) {
    console.error("Error getting client by ID:", error);
    return undefined;
  }
};

export const deleteClient = async (
  clientToDelete: ClientWithInvoicesResponse,
) => {
  try {
    const response = await fetch(`/api/clients/${clientToDelete.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete client");
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
