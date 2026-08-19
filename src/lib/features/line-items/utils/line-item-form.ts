import type { NewLineItemWithId, UIKey } from "../types";

export const newLineItem = (id: UIKey): NewLineItemWithId => ({
  amount: 0,
  description: "",
  id,
  quantity: 0,
});
