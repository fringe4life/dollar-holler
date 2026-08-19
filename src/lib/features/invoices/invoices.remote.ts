import { command, form, query, requested } from "$app/server";
import { object, picklist } from "valibot";
import {
  requireUser,
  requireUserMutation,
} from "#features/auth/require-user.server.ts";
import {
  clientInvoiceSummary,
  clientPickerOptions,
  listClientInvoices,
} from "#features/clients/clients.remote.ts";
import { fetchInvoiceDetail } from "#features/invoices/queries/invoice-detail.server.ts";
import { fetchPaginatedInvoices } from "#features/invoices/queries/invoices-list.server.ts";
import {
  deleteInvoiceRow,
  fetchInvoiceById,
  patchInvoiceStatus,
} from "#features/invoices/queries/invoices-write.server.ts";
import { persistInvoice } from "#features/invoices/queries/persist-invoice.server.ts";
import { invoiceFormSchema } from "#features/invoices/schemas.ts";
import {
  cursorSchema,
  idSchema,
  listQuerySchema,
} from "#features/pagination/schemas.ts";

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

export const saveInvoice = form(invoiceFormSchema, async (data) => {
  const user = await requireUserMutation();
  const result = await persistInvoice(user.id, data);
  void getInvoice(result.id).refresh();
  void getInvoiceDetail(result.id).refresh();
  if (data.isNewClient) {
    void clientPickerOptions().refresh();
  }
  await refreshInvoiceLists();
  return result;
}).preflight(invoiceFormSchema);

export const updateInvoiceStatus = command(
  object({
    id: cursorSchema,
    invoiceStatus: picklist(["draft", "sent", "paid"]),
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
