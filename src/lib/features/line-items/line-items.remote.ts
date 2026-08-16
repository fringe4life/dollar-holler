import "#lib/utils/arktype.config.ts";
import { type } from "arktype";
import { command, query, requested } from "$app/server";
import {
  requireUser,
  requireUserMutation,
} from "#features/auth/require-user.server.ts";
import {
  getInvoiceDetail,
  listInvoices,
} from "#features/invoices/invoices.remote.ts";
import {
  clientInvoiceSummary,
  listClientInvoices,
} from "#features/clients/clients.remote.ts";
import { lineItemInsertSchema } from "#features/line-items/schemas.server.ts";
import {
  deleteLineItemRow,
  fetchLineItemsForEdit,
  insertLineItems,
  replaceLineItems as replaceLineItemRows,
} from "#features/line-items/queries/line-items.server.ts";
import { cursorSchema, idSchema } from "#features/pagination/schemas.server.ts";

const lineItemsBodySchema = type({
  invoiceId: cursorSchema,
  lineItems: lineItemInsertSchema.array(),
});

export const listLineItemsForEdit = query(cursorSchema, async (invoiceId) => {
  const user = requireUser();
  return fetchLineItemsForEdit(user.id, invoiceId);
});

const refreshAfterLineItems = async (invoiceId: typeof cursorSchema.infer) => {
  void listLineItemsForEdit(invoiceId).refresh();
  void getInvoiceDetail(invoiceId).refresh();
  await requested(listInvoices, 8).refreshAll();
  await requested(listClientInvoices, 8).refreshAll();
  await requested(clientInvoiceSummary, 8).refreshAll();
};

export const createLineItems = command(
  lineItemsBodySchema,
  async ({ invoiceId, lineItems }) => {
    const user = await requireUserMutation();
    const result = await insertLineItems(user.id, invoiceId, lineItems);
    await refreshAfterLineItems(invoiceId);
    return result;
  }
);

export const replaceLineItems = command(
  lineItemsBodySchema,
  async ({ invoiceId, lineItems }) => {
    const user = await requireUserMutation();
    const result = await replaceLineItemRows(user.id, invoiceId, lineItems);
    await refreshAfterLineItems(invoiceId);
    return result;
  }
);

export const deleteLineItem = command(idSchema, async ({ id }) => {
  const user = await requireUserMutation();
  const result = await deleteLineItemRow(user.id, id);
  await requested(listInvoices, 8).refreshAll();
  await requested(listClientInvoices, 8).refreshAll();
  await requested(clientInvoiceSummary, 8).refreshAll();
  return result;
});
