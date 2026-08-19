import { error } from "@sveltejs/kit";
import { insertClient } from "#features/clients/queries/clients-write.server.ts";
import { verifyClient } from "#features/clients/queries/verify-client.ts";
import {
  insertInvoice,
  patchInvoice,
} from "#features/invoices/queries/invoices-write.server.ts";
import type { InvoiceFormData } from "#features/invoices/schemas.ts";
import {
  insertLineItems,
  replaceLineItems,
} from "#features/line-items/queries/line-items.server.ts";
import type { CursorId } from "#lib/types.ts";
import {
  emptyToNull,
  filterInvoiceFormLineItems,
  newClientFromInvoiceForm,
} from "../utils/invoice-form-line-items";

const persistClientId = async (
  userId: string,
  data: InvoiceFormData
): Promise<CursorId> => {
  if (data.isNewClient) {
    const body = newClientFromInvoiceForm(data);
    if (!body) {
      error(400, "Client name and email required");
    }
    const { id } = await insertClient(userId, body);
    return id;
  }

  if (!data.clientId) {
    error(400, "Select a client");
  }
  if (!(await verifyClient(userId, data.clientId))) {
    error(404, "Client not found");
  }
  return data.clientId;
};

const invoiceFieldsFromForm = (data: InvoiceFormData, clientId: CursorId) => ({
  clientId,
  discount: data.discount,
  dueDate: new Date(data.dueDate),
  invoiceNumber: data.invoiceNumber,
  issueDate: new Date(data.issueDate),
  notes: emptyToNull(data.notes),
  subject: data.subject,
  terms: emptyToNull(data.terms),
});

export const persistInvoice = async (
  userId: string,
  data: InvoiceFormData
): Promise<{ id: CursorId }> => {
  const clientId = await persistClientId(userId, data);
  const lineItems = filterInvoiceFormLineItems(data.lineItems);
  const fields = invoiceFieldsFromForm(data, clientId);

  if (data.id) {
    await patchInvoice(userId, data.id, fields);
    await replaceLineItems(userId, data.id, lineItems);
    return { id: data.id };
  }

  const { id } = await insertInvoice(userId, {
    ...fields,
    invoiceStatus: "draft",
  });
  if (lineItems.length > 0) {
    await insertLineItems(userId, id, lineItems);
  }
  return { id };
};
