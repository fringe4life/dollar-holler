import "#lib/utils/arktype.config.ts";
import { type } from "arktype";
import { command, query, requested } from "$app/server";
import {
  requireUser,
  requireUserMutation,
} from "#features/auth/require-user.server.ts";
import {
  clientInvoiceSummary,
  listClientInvoices,
} from "#features/clients/clients.remote.ts";
import { fetchInvoiceDetail } from "#features/invoices/queries/invoice-detail.server.ts";
import { fetchPaginatedInvoices } from "#features/invoices/queries/invoices-list.server.ts";
import {
  deleteInvoiceRow,
  fetchInvoiceById,
  insertInvoice,
  patchInvoice,
  patchInvoiceStatus,
} from "#features/invoices/queries/invoices-write.server.ts";
import {
  invoiceInsertSchema,
  invoiceUpdateSchema,
} from "#features/invoices/schemas.server.ts";
import {
  cursorSchema,
  idSchema,
  listQuerySchema,
} from "#features/pagination/schemas.server.ts";

export const listInvoices = query(listQuerySchema, async (normalized) => {
  const user = requireUser();
  return fetchPaginatedInvoices(user.id, normalized);
});

export const getInvoice = query(cursorSchema, async (id) => {
  const user = requireUser();
  return fetchInvoiceById(user.id, id);
});

export const getInvoiceDetail = query(cursorSchema, async (id) => {
  const user = requireUser();
  return fetchInvoiceDetail(user.id, id);
});

const refreshInvoiceLists = async () => {
  await requested(listInvoices, 8).refreshAll();
  await requested(listClientInvoices, 8).refreshAll();
  await requested(clientInvoiceSummary, 8).refreshAll();
};

export const createInvoice = command(invoiceInsertSchema, async (body) => {
  const user = await requireUserMutation();
  const result = await insertInvoice(user.id, body);
  await refreshInvoiceLists();
  return result;
});

export const updateInvoice = command(
  type({
    id: cursorSchema,
    patch: invoiceUpdateSchema,
  }),
  async ({ id, patch }) => {
    const user = await requireUserMutation();
    const result = await patchInvoice(user.id, id, patch);
    void getInvoice(id).refresh();
    void getInvoiceDetail(id).refresh();
    await refreshInvoiceLists();
    return result;
  }
);

export const updateInvoiceStatus = command(
  type({
    id: cursorSchema,
    invoiceStatus: "'draft' | 'sent' | 'paid'",
  }),
  async ({ id, invoiceStatus }) => {
    const user = await requireUserMutation();
    const result = await patchInvoiceStatus(user.id, id, invoiceStatus);
    void getInvoice(id).refresh();
    void getInvoiceDetail(id).refresh();
    await refreshInvoiceLists();
    return result;
  }
);

export const deleteInvoice = command(idSchema, async ({ id }) => {
  const user = await requireUserMutation();
  const result = await deleteInvoiceRow(user.id, id);
  await refreshInvoiceLists();
  return result;
});
