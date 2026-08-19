import { command, form, query, requested } from "$app/server";
import { error } from "@sveltejs/kit";
import { object, optional, string } from "valibot";
import {
  requireUser,
  requireUserMutation,
} from "#features/auth/require-user.server.ts";
import { fetchClientPickerOptions } from "#features/clients/queries/clients-options.server.ts";
import { fetchPaginatedClients } from "#features/clients/queries/clients-list.server.ts";
import {
  deleteClientRow,
  fetchClientById,
  insertClient,
  patchClient,
  patchClientStatus,
} from "#features/clients/queries/clients-write.server.ts";
import { verifyClient } from "#features/clients/queries/verify-client.ts";
import {
  clientFormSchema,
  clientStatusSchema,
} from "#features/clients/schemas.ts";
import {
  fetchClientInvoiceSummary,
  fetchPaginatedInvoicesForClient,
} from "#features/invoices/queries/invoices-list.server.ts";
import {
  cursorSchema,
  idSchema,
  listQuerySchema,
} from "#features/pagination/schemas.ts";

export const listClients = query(listQuerySchema, async (normalized) => {
  const user = requireUser();
  return fetchPaginatedClients(user.id, normalized);
});

export const clientPickerOptions = query(async () => {
  const user = requireUser();
  const options = await fetchClientPickerOptions(user.id);
  return { options };
});

export const getClient = query(cursorSchema, async (id) => {
  const user = requireUser();
  return fetchClientById(user.id, id);
});

export const listClientInvoices = query(
  object({
    clientId: cursorSchema,
    listQuery: listQuerySchema,
  }),
  async ({ clientId, listQuery }) => {
    const user = requireUser();
    if (!(await verifyClient(user.id, clientId))) {
      error(404, "Client not found");
    }
    return fetchPaginatedInvoicesForClient(user.id, clientId, listQuery);
  }
);

export const clientInvoiceSummary = query(
  object({
    clientId: cursorSchema,
    q: optional(string()),
  }),
  async ({ clientId, q }) => {
    const user = requireUser();
    if (!(await verifyClient(user.id, clientId))) {
      error(404, "Client not found");
    }
    return fetchClientInvoiceSummary(user.id, clientId, q);
  }
);

export const saveClient = form(clientFormSchema, async (data) => {
  const user = await requireUserMutation();
  const fields = {
    city: data.city,
    email: data.email,
    name: data.name,
    state: data.state,
    street: data.street,
    zip: data.zip,
  };

  if (data.id) {
    const result = await patchClient(user.id, data.id, fields);
    getClient(data.id).set(result);
    void clientPickerOptions().refresh();
    await requested(listClients, 4).refreshAll();
    return { id: result.id };
  }

  const result = await insertClient(user.id, {
    ...fields,
    clientStatus: "active",
  });
  void clientPickerOptions().refresh();
  await requested(listClients, 4).refreshAll();
  return result;
}).preflight(clientFormSchema);

export const updateClientStatus = command(
  object({
    id: cursorSchema,
    ...clientStatusSchema.entries,
  }),
  async ({ id, clientStatus }) => {
    const user = await requireUserMutation();
    const result = await patchClientStatus(user.id, id, clientStatus);
    await requested(listClients, 4).refreshAll();
    return result;
  }
);

export const deleteClient = command(idSchema, async ({ id }) => {
  const user = await requireUserMutation();
  const result = await deleteClientRow(user.id, id);
  void clientPickerOptions().refresh();
  await requested(listClients, 4).refreshAll();
  return result;
});
