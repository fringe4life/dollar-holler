import { client } from "$lib/client";
import {
  normalizeToNull,
  transformNullToUndefined,
} from "$lib/utils/typeHelpers";
import type { ClientSelect, NewClient } from "$lib/validators";
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
      const { data: clientData } = await client.api.clients.get();
      if (
        !clientData ||
        (typeof clientData === "object" && "error" in clientData)
      ) {
        throw new Error(clientData?.error || "Failed to load clients");
      }
      this.clients.length = 0;
      this.clients.push(...clientData);
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
      const { data: clientData } = await client.api.clients({ id }).get();
      if (
        !clientData ||
        (typeof clientData === "object" && "error" in clientData)
      ) {
        throw new Error(clientData?.error || "Failed to load client");
      }

      return clientData;
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
      const { data } = await client.api.clients({ id: clientId }).delete();
      if (data && typeof data === "object" && "error" in data) {
        throw new Error(data.error || "Failed to delete client");
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
      const body = transformNullToUndefined(clientData);

      let responseData: { id?: string; error?: string } | ClientSelect;
      if (isUpdate && clientData.id) {
        const { data } = await client.api
          .clients({ id: clientData.id })
          .put(body);
        if (!data || (typeof data === "object" && "error" in data)) {
          throw new Error(data?.error || "Failed to update client");
        }
        responseData = data;
      } else {
        const { data } = await client.api.clients.post(body);
        if (!data || (typeof data === "object" && "error" in data)) {
          throw new Error(data?.error || "Failed to create client");
        }
        responseData = data;
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
        const id = (responseData as { id: string }).id;
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

// Export store instance and reactive properties
export const { clients, loading, error, isLoaded } = clientsStore;
