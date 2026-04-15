import { client } from "$lib/client";
import type { ClientStatus } from "$lib/db/types";
import type { CursorPaginatedList } from "$lib/features/pagination/types";
import { CursorPaginatedListStoreBase } from "$lib/stores/cursor-paginated-base.svelte";
import type { CursorId, Maybe } from "$lib/types";
import {
  StoreOperation,
  getErrorMessage,
  isAbortError,
} from "$lib/utils/error-message";
import { transformNullToUndefined } from "$lib/utils/typeHelpers";
import { unwrapTreaty, unwrapTreatyResult } from "$lib/utils/unwrap";
import { toast } from "svelte-sonner";
import type {
  ClientInsert,
  ClientListResponse,
  ClientPickerOption,
  ClientSelect,
  ClientUpdate,
} from "../types";

export class ClientsStore extends CursorPaginatedListStoreBase<ClientListResponse> {
  protected readonly resourceSingular = "client";
  protected readonly resourcePlural = "clients";

  /** Id + name for invoice client `<select>` (GET /api/clients/options). */
  clientPickerOptions = $state<ClientPickerOption[]>([]);

  newClient(): ClientInsert {
    return {
      city: "",
      email: "",
      name: "",
      state: "",
      street: "",
      zip: "",
      clientStatus: "active",
    };
  }

  protected async fetchList(
    query: Record<string, string>,
    signal: AbortSignal
  ): Promise<CursorPaginatedList<ClientListResponse>> {
    return unwrapTreatyResult(
      await client.api.clients.get({
        query,
        fetch: { signal },
      }),
      { fallbackMessage: this.fallbackFor(StoreOperation.loadMany) }
    );
  }

  async loadClientPickerOptions(signal?: AbortSignal): Promise<void> {
    const data = await unwrapTreaty(
      client.api.clients.options.get({
        fetch: signal ? { signal } : undefined,
      }),
      { fallbackMessage: "Failed to load client options" }
    );
    this.clientPickerOptions.length = 0;
    this.clientPickerOptions.push(...data.options);
  }

  private upsertPickerOption(option: ClientPickerOption) {
    const i = this.clientPickerOptions.findIndex((o) => o.id === option.id);
    if (i === -1) {
      this.clientPickerOptions.push(option);
      this.clientPickerOptions.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      );
    } else {
      this.clientPickerOptions[i] = option;
    }
  }

  async getClientById(id: string): Promise<Maybe<ClientSelect>> {
    const fallback = this.fallbackFor(StoreOperation.loadOne);
    try {
      return await unwrapTreaty(client.api.clients({ id }).get(), {
        fallbackMessage: fallback,
      });
    } catch (err) {
      if (isAbortError(err)) {
        return null;
      }
      const errorMessage = getErrorMessage(err, fallback);
      console.error("Error loading client:", err);
      toast.error(errorMessage);
      return null;
    }
  }

  async deleteClient(clientId: string) {
    const fallback = this.fallbackFor(StoreOperation.deleteOne);
    try {
      unwrapTreatyResult(await client.api.clients({ id: clientId }).delete(), {
        fallbackMessage: fallback,
      });

      const index = this.items.findIndex((c) => c.id === clientId);
      if (index !== -1) {
        this.items.splice(index, 1);
      }
      const pickerIndex = this.clientPickerOptions.findIndex(
        (c) => c.id === clientId
      );
      if (pickerIndex !== -1) {
        this.clientPickerOptions.splice(pickerIndex, 1);
      }

      toast.success("Client deleted successfully");
    } catch (err) {
      const errorMessage = getErrorMessage(err, fallback);
      console.error("Error deleting client:", err);
      toast.error(errorMessage);
    }
  }

  async updateClientStatus(clientId: CursorId, clientStatus: ClientStatus) {
    try {
      const { id, ...rest } = await unwrapTreaty(
        client.api.clients({ id: clientId }).patch({ clientStatus }),
        { fallbackMessage: "Failed to update client status" }
      );

      const index = this.items.findIndex((c) => c.id === clientId);
      if (index !== -1) {
        this.items[index] = {
          ...this.items[index],
          ...rest,
        };
      } else {
        throw new Error("Client not found");
      }

      toast.success("Client updated successfully");
    } catch (err) {
      const fb = "Failed to update client status";
      const errorMessage = getErrorMessage(err, fb);
      console.error("Error updating client status:", err);
      toast.error(errorMessage);
    }
  }

  async createClient(clientData: ClientInsert): Promise<Maybe<CursorId>> {
    try {
      const body = transformNullToUndefined(clientData);
      const { id: _omitId, ...insertBody } = body;
      const responseData = await unwrapTreaty(
        client.api.clients.post(insertBody),
        { fallbackMessage: this.fallbackFor(StoreOperation.createOne) }
      );
      const id = responseData.id;
      if (!id) {
        throw new Error("Failed to create client");
      }
      const now = new Date();
      const newClient = {
        ...insertBody,
        id,
        clientStatus: insertBody.clientStatus ?? "active",
        createdAt: now,
        updatedAt: now,
        received: 0,
        balance: 0,
      } satisfies ClientListResponse;
      this.items.push(newClient);
      this.upsertPickerOption({ id, name: clientData.name });
      toast.success("Client created successfully");
      return id;
    } catch (err) {
      const fallback = this.fallbackFor(StoreOperation.createOne);
      const errorMessage = getErrorMessage(err, fallback);
      console.error("Error creating client:", err);
      toast.error(errorMessage);
      return null;
    }
  }

  async updateClient(
    id: CursorId,
    patch: ClientUpdate
  ): Promise<Maybe<CursorId>> {
    try {
      const body = transformNullToUndefined(patch);
      const responseData = await unwrapTreaty(
        client.api.clients({ id }).put(body),
        { fallbackMessage: this.fallbackFor(StoreOperation.updateOne) }
      );
      const index = this.items.findIndex((c) => c.id === responseData.id);
      if (index !== -1) {
        this.items[index] = {
          ...this.items[index],
          ...body,
          updatedAt: new Date(),
        };
      }
      this.upsertPickerOption({
        id: responseData.id,
        name: responseData.name,
      });
      toast.success("Client updated successfully");
      return responseData.id;
    } catch (err) {
      const fallback = this.fallbackFor(StoreOperation.updateOne);
      const errorMessage = getErrorMessage(err, fallback);
      console.error("Error updating client:", err);
      toast.error(errorMessage);
      return null;
    }
  }
}
