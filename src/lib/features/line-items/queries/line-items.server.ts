import { error } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { verifyInvoice } from "#features/invoices/queries/verify-invoice.ts";
import { db } from "#lib/server/db/index.ts";
import { lineItems as lineItemsTable } from "#lib/server/db/schema.ts";
import type { CursorId } from "#lib/types.ts";
import type { LineItemEditRow, LineItemInsert } from "../types";

const assertInvoiceOwned = async (userId: string, invoiceId: CursorId) => {
  if (!(await verifyInvoice(userId, invoiceId))) {
    error(404, "Invoice not found");
  }
};

export const fetchLineItemsForEdit = async (
  userId: string,
  invoiceId: CursorId
): Promise<LineItemEditRow[]> => {
  await assertInvoiceOwned(userId, invoiceId);
  return db.query.lineItems.findMany({
    columns: {
      amount: true,
      description: true,
      id: true,
      quantity: true,
    },
    where: {
      invoiceId: { eq: invoiceId },
      userId: { eq: userId },
    },
  });
};

export const insertLineItems = async (
  userId: string,
  invoiceId: CursorId,
  lineItems: LineItemInsert[]
) => {
  await assertInvoiceOwned(userId, invoiceId);
  const items = lineItems.map(({ id: _lid, ...item }) => ({
    ...item,
    invoiceId,
    userId,
  }));
  return db.insert(lineItemsTable).values(items).returning();
};

export const replaceLineItems = async (
  userId: string,
  invoiceId: CursorId,
  lineItems: LineItemInsert[]
) => {
  await assertInvoiceOwned(userId, invoiceId);
  const deleteExisting = db
    .delete(lineItemsTable)
    .where(
      and(
        eq(lineItemsTable.invoiceId, invoiceId),
        eq(lineItemsTable.userId, userId)
      )
    );
  if (lineItems.length === 0) {
    await deleteExisting;
    return [];
  }
  const [_deleted, inserted] = await db.batch([
    deleteExisting,
    db
      .insert(lineItemsTable)
      .values(
        lineItems.map((item) => ({
          ...item,
          invoiceId,
          userId,
        }))
      )
      .returning(),
  ]);
  return inserted;
};
