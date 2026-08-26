import { error } from "@sveltejs/kit";
import { and, eq, notInArray, or, sql } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import { verifyInvoice } from "#features/invoices/queries/verify-invoice.ts";
import { db } from "#lib/server/db/index.ts";
import { lineItems as lineItemsTable } from "#lib/server/db/schema.ts";
import type { CursorId } from "#lib/schemas/cursor-id.ts";
import type { LineItemEditRow, LineItemInsert } from "../types";
import { planLineItemSync } from "../utils/line-item-sync";

const assertInvoiceOwned = async (userId: string, invoiceId: CursorId) => {
  if (!(await verifyInvoice(userId, invoiceId))) {
    error(404, "Invoice not found");
  }
};

const lineItemsOwnedByInvoice = (userId: string, invoiceId: CursorId) =>
  and(
    eq(lineItemsTable.invoiceId, invoiceId),
    eq(lineItemsTable.userId, userId)
  );

const runLineItemStatements = async (statements: BatchItem<"sqlite">[]) => {
  if (statements.length === 0) {
    return;
  }
  if (statements.length === 1) {
    const [only] = statements;
    if (only) {
      await only;
    }
    return;
  }
  await db.batch(statements as [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]]);
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

/** Keep owned rows, upsert payload, insert new, delete missing — one batch. */
export const syncLineItems = async (
  userId: string,
  invoiceId: CursorId,
  lineItems: LineItemInsert[]
) => {
  await assertInvoiceOwned(userId, invoiceId);
  const existing = await db.query.lineItems.findMany({
    columns: { id: true },
    where: {
      invoiceId: { eq: invoiceId },
      userId: { eq: userId },
    },
  });
  const { keepIds, toInsert, toUpsert } = planLineItemSync(
    existing.map((row) => row.id),
    lineItems
  );
  const owned = lineItemsOwnedByInvoice(userId, invoiceId);
  const deleteWhere =
    keepIds.length === 0
      ? owned
      : and(owned, notInArray(lineItemsTable.id, keepIds));
  const statements: BatchItem<"sqlite">[] = [
    db.delete(lineItemsTable).where(deleteWhere),
  ];

  if (toUpsert.length > 0) {
    statements.push(
      db
        .insert(lineItemsTable)
        .values(
          toUpsert.map((item) => ({
            ...item,
            invoiceId,
            userId,
          }))
        )
        .onConflictDoUpdate({
          set: {
            amount: sql`excluded.amount`,
            description: sql`excluded.description`,
            quantity: sql`excluded.quantity`,
            updatedAt: new Date(),
          },
          setWhere: and(
            owned,
            or(
              sql`${lineItemsTable.amount} != excluded.amount`,
              sql`${lineItemsTable.description} != excluded.description`,
              sql`${lineItemsTable.quantity} != excluded.quantity`
            )
          ),
          target: lineItemsTable.id,
        })
    );
  }

  if (toInsert.length > 0) {
    statements.push(
      db.insert(lineItemsTable).values(
        toInsert.map((item) => ({
          ...item,
          invoiceId,
          userId,
        }))
      )
    );
  }

  await runLineItemStatements(statements);
};
