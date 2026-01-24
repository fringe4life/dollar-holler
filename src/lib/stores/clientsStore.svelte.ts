import {
  normalizeToNull,
  transformNullToUndefined,
} from "$lib/utils/typeHelpers";
import type { ClientSelect, NewClient } from "$lib/validators";
import { clientSelectWithDatesSchema } from "$lib/validators";
import { ArkErrors } from "arktype";
import { toast } from "svelte-sonner";

class ClientsStore {
  // Use $state for reactive class fields
  clients = $state<ClientSelect[]>([]);
  loading = $state(false);
  error = $state<string | null>(null);

  // Use $derived for computed values
  isLoaded = $derived(this.clients.length > 0 || this.error !== null);

  // Load all clients (without relations)
  async loadClients() {
    this.loading = true;
    this.error = null;

    try {
      const response = await fetch("/api/clients");
      if (!response.ok) {
        throw new Error("Failed to load clients");
      }
      const rawData = await response.json();

      // Validate response with ArkType
      const validationResult = clientSelectWithDatesSchema.array()(rawData);
      if (validationResult instanceof ArkErrors) {
        console.error(
          "Invalid client data received:",
          validationResult.summary
        );
        throw new Error("Invalid client data received from server");
      }

      // Update the reactive state
      this.clients.length = 0;
      this.clients.push(...validationResult);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load clients";
      this.error = errorMessage;
      console.error("Error loading clients:", err);
      toast.error(errorMessage);
    } finally {
      this.loading = false;
    }
  }

  // Load a single client by ID (without relations)
  async getClientById(id: string): Promise<ClientSelect | null> {
    try {
      const response = await fetch(`/api/clients/${id}`);
      if (!response.ok) {
        throw new Error("Failed to load client");
      }
      const rawData = await response.json();

      // Validate response with ArkType
      const validationResult = clientSelectWithDatesSchema(rawData);
      if (validationResult instanceof ArkErrors) {
        console.error(
          "Invalid client data received:",
          validationResult.summary
        );
        throw new Error("Invalid client data received from server");
      }

      return validationResult;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load client";
      console.error("Error loading client:", err);
      toast.error(errorMessage);
      return null;
    }
  }

  // Delete client
  async deleteClient(clientId: string) {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete client");
      }

      // Remove from local state
      const index = this.clients.findIndex((client) => client.id === clientId);
      if (index !== -1) {
        this.clients.splice(index, 1);
      }

      toast.success("Client deleted successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete client";
      console.error("Error deleting client:", err);
      toast.error(errorMessage);
    }
  }

  // Upsert client (create or update)
  async upsertClient(clientData: NewClient): Promise<string | null> {
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
        throw new Error(`Failed to ${isUpdate ? "update" : "create"} client`);
      }

      if (isUpdate && clientData.id) {
        // Update existing client in state
        const index = this.clients.findIndex((c) => c.id === clientData.id);
        if (index !== -1) {
          this.clients[index] = {
            ...this.clients[index],
            ...clientData,
            id: clientData.id,
            updatedAt: new Date(),

            email: normalizeToNull(clientData.email),
            street: normalizeToNull(clientData.street),
            city: normalizeToNull(clientData.city),
            state: normalizeToNull(clientData.state),
            zip: normalizeToNull(clientData.zip),
            clientStatus: normalizeToNull(clientData.clientStatus),
          };
        }
        toast.success("Client updated successfully");
        return clientData.id;
      } else {
        // Add new client to state
        const { id } = await response.json();
        const newClient: ClientSelect = {
          ...clientData,
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
          email: normalizeToNull(clientData.email),
          street: normalizeToNull(clientData.street),
          city: normalizeToNull(clientData.city),
          state: normalizeToNull(clientData.state),
          zip: normalizeToNull(clientData.zip),
          clientStatus: normalizeToNull(clientData.clientStatus),
        };
        this.clients.push(newClient);
        toast.success("Client created successfully");
        return id;
      }
    } catch (err) {
      const isUpdate = !!clientData.id;
      const errorMessage =
        err instanceof Error
          ? err.message
          : `Failed to ${isUpdate ? "update" : "create"} client`;
      console.error(`Error ${isUpdate ? "updating" : "creating"} client:`, err);
      toast.error(errorMessage);
      return null;
    }
  }

  // Reset store
  resetClients() {
    this.clients.length = 0;
    this.loading = false;
    this.error = null;
  }
}

// Create and export a singleton instance
export const clientsStore = new ClientsStore();

// Export convenience methods for backward compatibility
export const {
  clients,
  loading,
  error,
  isLoaded,
  loadClients,
  getClientById,
  deleteClient,
  upsertClient,
  resetClients,
} = clientsStore;
