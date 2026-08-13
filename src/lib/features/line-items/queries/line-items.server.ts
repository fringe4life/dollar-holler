import { error } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { verifyInvoice } from "#features/invoices/queries/verify-invoice";
import { db } from "#lib/server/db";
import { lineItems as lineItemsTable } from "#lib/server/db/schema";
import type { CursorId } from "#lib/types";
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
  await db
    .delete(lineItemsTable)
    .where(
      and(
        eq(lineItemsTable.invoiceId, invoiceId),
        eq(lineItemsTable.userId, userId)
      )
    );
  return db
    .insert(lineItemsTable)
    .values(
      lineItems.map((item) => ({
        ...item,
        invoiceId,
        userId,
      }))
    )
    .returning();
};

export const deleteLineItemRow = async (userId: string, id: CursorId) => {
  const [deleted] = await db
    .delete(lineItemsTable)
    .where(and(eq(lineItemsTable.id, id), eq(lineItemsTable.userId, userId)))
    .returning({ id: lineItemsTable.id });
  if (!deleted) {
    error(404, "Line item not found");
  }
  return { success: true as const };
};
