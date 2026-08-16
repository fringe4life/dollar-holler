import "#lib/utils/arktype.config.ts";
import { type } from "arktype";
import { command, query, requested } from "$app/server";
import { error } from "@sveltejs/kit";
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
  clientInsertSchema,
  clientStatusSchema,
  clientUpdateSchema,
} from "#features/clients/schemas.server.ts";
import {
  fetchClientInvoiceSummary,
  fetchPaginatedInvoicesForClient,
} from "#features/invoices/queries/invoices-list.server.ts";
import {
  cursorSchema,
  idSchema,
  listQuerySchema,
} from "#features/pagination/schemas.server.ts";

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
  type({
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
  type({
    clientId: cursorSchema,
    "q?": "string",
  }),
  async ({ clientId, q }) => {
    const user = requireUser();
    if (!(await verifyClient(user.id, clientId))) {
      error(404, "Client not found");
    }
    return fetchClientInvoiceSummary(user.id, clientId, q);
  }
);

export const createClient = command(clientInsertSchema, async (body) => {
  const user = await requireUserMutation();
  const result = await insertClient(user.id, body);
  void clientPickerOptions().refresh();
  await requested(listClients, 4).refreshAll();
  return result;
});

export const updateClient = command(
  type({
    id: cursorSchema,
    patch: clientUpdateSchema,
  }),
  async ({ id, patch }) => {
    const user = await requireUserMutation();
    const result = await patchClient(user.id, id, patch);
    getClient(id).set(result);
    void clientPickerOptions().refresh();
    await requested(listClients, 4).refreshAll();
    return { id: result.id };
  }
);

export const updateClientStatus = command(
  type({
    id: cursorSchema,
  }).and(clientStatusSchema),
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
