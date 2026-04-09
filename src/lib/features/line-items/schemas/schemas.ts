import { cursorSchema } from "$lib/features/pagination/schemas";
import { type } from "arktype";

export const lineItemSchema = type({
  id: cursorSchema.optional(),
  userId: "string",
  description: "string",
  quantity: "number",
  amount: "number",
});

export const newLineItemSchema = type({
  "id?": "string",
  userId: "string",
  description: "string",
  quantity: "number",
  amount: "number > 0",
});

export const lineItemsSchema = type({
  lineItems: lineItemSchema.array().optional(),
});
