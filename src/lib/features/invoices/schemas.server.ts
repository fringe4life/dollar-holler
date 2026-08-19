import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-orm/valibot";
import {
  check,
  date,
  nullable,
  number,
  object,
  omit,
  optional,
  pipe,
  string,
  transform,
  union,
} from "valibot";
import { cursorSchema } from "#features/pagination/schemas.ts";
import type { SanitizedHTML } from "#lib/types.ts";
import { invoices } from "#lib/server/db/schema.ts";

const sanitizedHtml = pipe(
  string(),
  transform((value): SanitizedHTML => value as SanitizedHTML)
);

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
  notesHtml: () => nullable(sanitizedHtml),
  termsHtml: () => nullable(sanitizedHtml),
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
