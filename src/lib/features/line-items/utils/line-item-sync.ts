import type { CursorId } from "#lib/schemas/cursor-id.ts";
import type { LineItemInsert } from "../types";

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

const toUpsertRow = (
  id: CursorId,
  item: LineItemInsert
): LineItemSyncPlan["toUpsert"][number] => ({
  amount: item.amount,
  description: item.description,
  id,
  quantity: resolvedQuantity(item.quantity),
});

/**
 * Classify incoming lines vs currently owned ids.
 * Field equality is left to SQL `ON CONFLICT … WHERE` so the save payload
 * always writes; a pre-read snapshot cannot skip mutations.
 * Duplicate owned ids: last occurrence wins.
 */
export const planLineItemSync = (
  existingIds: Iterable<CursorId>,
  incoming: LineItemInsert[]
): LineItemSyncPlan => {
  const ownedIds = new Set(existingIds);
  const keepIds: CursorId[] = [];
  const seenKeep = new Set<CursorId>();
  const toInsert: LineItemSyncPlan["toInsert"] = [];
  const upsertById = new Map<CursorId, LineItemSyncPlan["toUpsert"][number]>();

  for (const item of incoming) {
    const ownedId =
      item.id !== undefined && ownedIds.has(item.id) ? item.id : undefined;
    if (ownedId === undefined) {
      toInsert.push({
        amount: item.amount,
        description: item.description,
        quantity: resolvedQuantity(item.quantity),
      });
      continue;
    }
    if (!seenKeep.has(ownedId)) {
      seenKeep.add(ownedId);
      keepIds.push(ownedId);
    }
    upsertById.set(ownedId, toUpsertRow(ownedId, item));
  }

  return { keepIds, toInsert, toUpsert: [...upsertById.values()] };
};
