import type { LineItemInsert } from "$features/line-items/types";
import { stripNullishEntries } from "$lib/utils/strip-nullish-entries";
import type { InvoiceInsert, InvoiceSelect, InvoiceUpdate } from "../types";

/** Invoice columns allowed on PATCH (excludes id, userId, timestamps). */
const INVOICE_PATCH_KEYS = [
  "clientId",
  "invoiceNumber",
  "subject",
  "issueDate",
  "dueDate",
  "discount",
  "notes",
  "terms",
  "invoiceStatus",
] as const;

type InvoicePatchKey = (typeof INVOICE_PATCH_KEYS)[number];

export type InvoicePatchSnapshot = Pick<InvoiceInsert, InvoicePatchKey>;

const normalizeOptionalText = (
  value: string | null | undefined
): string | null => {
  if (value == null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

const optionalTextEqual = (
  a: string | null | undefined,
  b: string | null | undefined
): boolean => normalizeOptionalText(a) === normalizeOptionalText(b);

const datesEqual = (a: Date, b: Date): boolean => a.getTime() === b.getTime();

export const pickInvoicePatchSnapshot = (
  invoice: InvoiceInsert | InvoiceSelect
): InvoicePatchSnapshot => ({
  clientId: invoice.clientId,
  invoiceNumber: invoice.invoiceNumber,
  subject: invoice.subject,
  issueDate: invoice.issueDate,
  dueDate: invoice.dueDate,
  discount: invoice.discount,
  notes: invoice.notes ?? null,
  terms: invoice.terms ?? null,
  invoiceStatus: invoice.invoiceStatus ?? "draft",
});

export const computeInvoicePatchDelta = (
  baseline: InvoicePatchSnapshot,
  current: InvoicePatchSnapshot
): InvoiceUpdate => {
  const raw: Record<string, unknown> = {};

  for (const key of INVOICE_PATCH_KEYS) {
    const b = baseline[key];
    const c = current[key];
    if (key === "issueDate" || key === "dueDate") {
      if (!datesEqual(b as Date, c as Date)) {
        raw[key] = c;
      }
    } else if (key === "notes" || key === "terms") {
      if (!optionalTextEqual(b as string | null, c as string | null)) {
        raw[key] = normalizeOptionalText(c as string | null);
      }
    } else if (b !== c) {
      raw[key] = c;
    }
  }

  return stripNullishEntries(raw) as InvoiceUpdate;
};

/** Stable serialization for comparing normalized line-item payloads (edit flow). */
export const serializedNormalizedLineItemsForCompare = (
  items: LineItemInsert[]
): string => {
  const rows = items
    .map((item) => ({
      id: item.id ?? "",
      description: String(item.description ?? "").trim(),
      quantity: item.quantity,
      amount: item.amount,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
  return JSON.stringify(rows);
};
