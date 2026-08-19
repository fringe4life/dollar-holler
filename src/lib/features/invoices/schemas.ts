import {
  type InferOutput,
  array,
  boolean,
  check,
  email,
  forward,
  isoDate,
  minLength,
  number,
  object,
  optional,
  pipe,
  string,
} from "valibot";
import { cursorSchema } from "#features/pagination/schemas.ts";
import { optionalZipSchema } from "#lib/utils/zip.ts";

/** One invoice line in the HTML `form()` payload. */
export const invoiceFormLineItemSchema = object({
  amount: number(),
  description: string(),
  id: optional(cursorSchema),
  quantity: number(),
});

const invoiceFormObjectSchema = object({
  city: optional(string()),
  clientId: optional(cursorSchema),
  discount: optional(number(), 0),
  dueDate: pipe(string(), isoDate()),
  email: optional(pipe(string(), email())),
  id: optional(cursorSchema),
  invoiceNumber: pipe(string(), minLength(1, "Invoice number required")),
  isNewClient: optional(boolean(), false),
  issueDate: pipe(string(), isoDate()),
  lineItems: optional(array(invoiceFormLineItemSchema), []),
  name: optional(string()),
  notes: optional(string()),
  state: optional(string()),
  street: optional(string()),
  subject: string(),
  terms: optional(string()),
  zip: optionalZipSchema,
});

/** HTML `form()` payload for create/edit invoice (strings + coerced numbers). */
export const invoiceFormSchema = pipe(
  invoiceFormObjectSchema,
  forward(
    check(
      (input) => input.isNewClient === true || Boolean(input.clientId),
      "Select a client"
    ),
    ["clientId"]
  ),
  forward(
    check(
      (input) => input.isNewClient !== true || Boolean(input.name?.trim()),
      "Client name required"
    ),
    ["name"]
  ),
  forward(
    check(
      (input) => input.isNewClient !== true || Boolean(input.email?.trim()),
      "Email required"
    ),
    ["email"]
  )
);

export type InvoiceFormData = InferOutput<typeof invoiceFormSchema>;
