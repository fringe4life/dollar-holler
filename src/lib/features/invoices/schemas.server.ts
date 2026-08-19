import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-orm/valibot";
import {
  check,
  date,
  number,
  object,
  omit,
  optional,
  pipe,
  string,
  transform,
  union,
} from "valibot";
import { cursorSchema } from "#lib/schemas/cursor-id.ts";
import { nullableSanitizedHtmlSchema } from "#lib/schemas/sanitized-html.server.ts";
import { invoices } from "#lib/server/db/schema.ts";

/**
 * JSON bodies encode dates as ISO strings; Drizzle valibot expects `Date`.
 * Accept `string | Date`, reject unparseable values, morph to `Date`.
 */
const isoTimestampFromWire = pipe(
  union([string(), date()]),
  check((value) => {
    const parsed = value instanceof Date ? value : new Date(value);
    return !Number.isNaN(parsed.getTime());
  }, "Invalid date"),
  transform((value) => (value instanceof Date ? value : new Date(value)))
);

const invoiceInsertRefine = {
  clientId: () => cursorSchema,
  dueDate: () => isoTimestampFromWire,
  id: () => optional(cursorSchema),
  issueDate: () => isoTimestampFromWire,
};

const invoiceSelectRefine = {
  clientId: () => cursorSchema,
  id: () => cursorSchema,
  notesHtml: () => nullableSanitizedHtmlSchema,
  termsHtml: () => nullableSanitizedHtmlSchema,
};

export const invoiceInsertSchema = omit(
  createInsertSchema(invoices, invoiceInsertRefine),
  ["userId", "createdAt", "updatedAt", "notesHtml", "termsHtml"]
);

export const invoiceSelectSchema = omit(
  createSelectSchema(invoices, invoiceSelectRefine),
  ["userId"]
);

export const invoiceUpdateSchema = omit(
  createUpdateSchema(invoices, invoiceInsertRefine),
  ["createdAt", "updatedAt", "userId", "notesHtml", "termsHtml"]
);

/** Cursor list row: invoice + client name + total (no long markdown/HTML text). */
export const invoiceListRowSchema = object({
  ...omit(invoiceSelectSchema, ["notes", "terms", "notesHtml", "termsHtml"])
    .entries,
  name: string(),
  total: number(),
});
