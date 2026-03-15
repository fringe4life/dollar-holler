import { db } from "$lib/db";
import { lineItems as lineItemsTable } from "$lib/db/schema";
import type { Maybe } from "$lib/types";
import type { Total } from "$lib/validators";
import { sum } from "drizzle-orm";

export const lineItemsTotalSubquery = db
  .select({
    invoiceId: lineItemsTable.invoiceId,
    subtotal: sum(lineItemsTable.amount).as("subtotal"),
  })
  .from(lineItemsTable)
  .groupBy(lineItemsTable.invoiceId)
  .as("line_items_total");

type RowWithSubtotal = {
  subtotal: Maybe<string | number>;
  discount: Maybe<string | number>;
};

export function mapRowsWithTotal<T extends RowWithSubtotal>(
  rows: T[]
): (Omit<T, "subtotal"> & Total)[] {
  return rows.map((row) => {
    const subtotal = Number(row.subtotal ?? 0);
    const discountPercent = Number(row.discount ?? 0);
    const total = Math.round(subtotal - subtotal * (discountPercent / 100));
    const { subtotal: _s, ...rest } = row;
    return { ...rest, total } satisfies Omit<T, "subtotal"> & Total;
  });
}
