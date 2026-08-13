import { error } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { db } from "#lib/server/db";
import { invoices as invoicesTable } from "#lib/server/db/schema";
import type { InvoiceStatus } from "#lib/server/db/types";
import { BadRequestError } from "#lib/server/utils/errors";
import {
  appendInvoiceNotesTermsHtmlForInsert,
  appendInvoiceNotesTermsHtmlForPatch,
} from "#lib/server/utils/invoice-notes-terms-html.server";
import { assertAllowedInvoiceStatusTransition } from "#lib/server/utils/invoice-status-transitions";
import type { CursorId } from "#lib/types";
import { stripNullishEntries } from "#lib/utils/strip-nullish-entries";
import type { InvoiceInsert, InvoiceSelect, InvoiceUpdate } from "../types";
import { verifyInvoiceStatus } from "./verify-invoice";

export const fetchInvoiceById = async (
  userId: string,
  id: CursorId
): Promise<InvoiceSelect> => {
  const invoice = await db.query.invoices.findFirst({
    where: { id: { eq: id }, userId: { eq: userId } },
  });
  if (!invoice) {
    error(404, "Invoice not found");
  }
  const { userId: _userId, ...rest } = invoice;
  return rest;
};

export const insertInvoice = async (
  userId: string,
  body: InvoiceInsert
): Promise<{ id: CursorId }> => {
  const html = appendInvoiceNotesTermsHtmlForInsert(body);
  const [inserted] = await db
    .insert(invoicesTable)
    .values({
      ...body,
      ...html,
      userId,
    })
    .returning({ id: invoicesTable.id });
  if (!inserted) {
    error(500, "Failed to add invoice");
  }
  return { id: inserted.id };
};

export const patchInvoice = async (
  userId: string,
  id: CursorId,
  body: InvoiceUpdate
): Promise<{ id: CursorId }> => {
  const current = await verifyInvoiceStatus(userId, id);
  if (!current?.id) {
    error(404, "Invoice not found");
  }
  if (body.invoiceStatus) {
    const status = current.invoiceStatus;
    if (!status) {
      error(404, "Invoice not found");
    }
    try {
      assertAllowedInvoiceStatusTransition(status, body.invoiceStatus);
    } catch (err) {
      if (err instanceof BadRequestError) {
        error(400, err.message);
      }
      throw err;
    }
  }
  const html = appendInvoiceNotesTermsHtmlForPatch(body);
  const setPayload = {
    ...stripNullishEntries({ ...body }),
    ...html,
  };
  const [updated] = await db
    .update(invoicesTable)
    .set(setPayload)
    .where(and(eq(invoicesTable.id, id), eq(invoicesTable.userId, userId)))
    .returning({ id: invoicesTable.id });
  if (!updated) {
    error(404, "Invoice not found");
  }
  return { id: updated.id };
};

export const patchInvoiceStatus = async (
  userId: string,
  id: CursorId,
  invoiceStatus: InvoiceStatus
): Promise<{ id: CursorId }> => patchInvoice(userId, id, { invoiceStatus });

export const deleteInvoiceRow = async (userId: string, id: CursorId) => {
  const [deleted] = await db
    .delete(invoicesTable)
    .where(and(eq(invoicesTable.id, id), eq(invoicesTable.userId, userId)))
    .returning({ id: invoicesTable.id });
  if (!deleted) {
    error(404, "Invoice not found");
  }
  return { success: true as const };
};
