import type { CursorId } from "#lib/schemas/cursor-id.ts";
import type { LineItemEditRow, LineItemInsert } from "../types";

export type LineItemSyncPlan = {
  keepIds: CursorId[];
  toInsert: Array<{
    amount: number;
    description: string;
    quantity: number;
  }>;
  toUpsert: Array<{
    amount: number;
    description: string;
    id: CursorId;
    quantity: number;
  }>;
};

/** Matches `line_items.quantity` column default. */
const DEFAULT_LINE_QUANTITY = 1;

const resolvedQuantity = (quantity: LineItemInsert["quantity"]): number =>
  quantity ?? DEFAULT_LINE_QUANTITY;

const lineFieldsEqual = (
  existing: LineItemEditRow,
  incoming: LineItemInsert
): boolean =>
  existing.amount === incoming.amount &&
  existing.description === incoming.description &&
  existing.quantity === resolvedQuantity(incoming.quantity);

/** Split incoming lines: keep owned ids, upsert changed, insert unknown/new. */
export const planLineItemSync = (
  existing: LineItemEditRow[],
  incoming: LineItemInsert[]
): LineItemSyncPlan => {
  const existingById = new Map(existing.map((row) => [row.id, row]));
  const keepIds: CursorId[] = [];
  const seenKeep = new Set<CursorId>();
  const toInsert: LineItemSyncPlan["toInsert"] = [];
  const upsertById = new Map<CursorId, LineItemSyncPlan["toUpsert"][number]>();

  for (const item of incoming) {
    const owned = item.id === undefined ? undefined : existingById.get(item.id);
    if (!owned) {
      toInsert.push({
        amount: item.amount,
        description: item.description,
        quantity: resolvedQuantity(item.quantity),
      });
      continue;
    }
    if (!seenKeep.has(owned.id)) {
      seenKeep.add(owned.id);
      keepIds.push(owned.id);
    }
    if (lineFieldsEqual(owned, item)) {
      upsertById.delete(owned.id);
      continue;
    }
    upsertById.set(owned.id, {
      amount: item.amount,
      description: item.description,
      id: owned.id,
      quantity: resolvedQuantity(item.quantity),
    });
  }

  return { keepIds, toInsert, toUpsert: [...upsertById.values()] };
};

export const shouldDeleteRemovedLineItems = (
  existing: LineItemEditRow[],
  keepIds: CursorId[]
): boolean => {
  const keep = new Set(keepIds);
  return existing.some((row) => !keep.has(row.id));
};
