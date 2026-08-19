import type { InferOutput } from "valibot";
import type { ClientInsert } from "#features/clients/types.ts";
import type {
  LineItemEditRow,
  LineItemInsert,
  NewLineItemWithId,
} from "#features/line-items/types.ts";
import type { CursorId } from "#lib/schemas/cursor-id.ts";
import type { InvoiceFormData, invoiceFormLineItemSchema } from "../schemas";
import { parse } from "valibot";
import { cursorSchema } from "#lib/schemas/cursor-id.ts";

type InvoiceFormLineItem = InferOutput<typeof invoiceFormLineItemSchema>;

/** Drop blank description rows; keep billed `amount` as submitted. */
export const filterInvoiceFormLineItems = (
  items: InvoiceFormLineItem[] | undefined
): LineItemInsert[] => {
  if (!items?.length) {
    return [];
  }
  const persisted: LineItemInsert[] = [];
  for (const item of items) {
    const description = item.description.trim();
    if (description.length === 0) {
      continue;
    }
    persisted.push({
      amount: item.amount,
      description,
      id: item.id,
      quantity: item.quantity,
    });
  }
  return persisted;
};

export const emptyToNull = (value: string | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

export const newClientFromInvoiceForm = (
  data: InvoiceFormData
): ClientInsert | null => {
  const name = data.name?.trim() ?? "";
  const email = data.email?.trim() ?? "";
  if (!name || !email) {
    return null;
  }
  return {
    city: data.city ?? "",
    clientStatus: "active",
    email,
    name,
    state: data.state ?? "",
    street: data.street ?? "",
    zip: data.zip ?? "",
  };
};

type LineItemFormFieldValues = {
  amount: number;
  description: string;
  persistedId: CursorId | undefined;
  quantity: number;
};

/** Defaults + persistable id for remote `fields.lineItems[i].*.as(...)`. */
export const lineItemFormFieldValues = (
  item: LineItemEditRow | NewLineItemWithId | undefined
): LineItemFormFieldValues => {
  const id = item?.id;
  return {
    amount: item?.amount ?? 0,
    description: item?.description ?? "",
    persistedId: typeof id === "string" ? parse(cursorSchema, id) : undefined,
    quantity: item?.quantity ?? 0,
  };
};

export const lineItemHiddenIdAttrs = <T>(
  persistedId: CursorId | undefined,
  asHidden: (id: CursorId) => T
): { id: T } | Record<string, never> => {
  if (!persistedId) {
    return {};
  }
  return { id: asHidden(persistedId) };
};
