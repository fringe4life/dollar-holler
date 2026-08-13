import type { LineItemInsert, NewLineItemWithId, UIKey } from "../types";
import type { LineItemEditRow } from "../types";

export const newLineItem = (id: UIKey): NewLineItemWithId => ({
  amount: 0,
  description: "",
  id,
  quantity: 0,
});

export const normalizeLineItems = (
  items: (LineItemEditRow | NewLineItemWithId)[]
): LineItemInsert[] => {
  if (items.length === 0) {
    return [];
  }
  return items.reduce<LineItemInsert[]>((acc, item) => {
    if ((item.description?.trim() ?? "").length > 0) {
      acc.push({
        ...item,
        id: typeof item.id === "number" ? undefined : item.id,
      });
    }
    return acc;
  }, []);
};
