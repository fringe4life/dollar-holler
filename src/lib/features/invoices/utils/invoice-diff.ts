import type {
  LineItemEditRow,
  LineItemInsert,
  NewLineItemWithId,
} from "$features/line-items/types";
import type { CursorId, Maybe } from "$lib/types";
import { err, ok, type Result } from "$lib/utils/result";
import { stripNullishEntries } from "$lib/utils/strip-nullish-entries";
import type {
  InvoiceInsert,
  InvoiceSelect,
  InvoiceUpdate,
  NewInvoice,
} from "../types";

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

const normalizeOptionalText = (value: Maybe<string>): string | null =>
  value ? value.trim() : null;

const optionalTextEqual = (a: Maybe<string>, b: Maybe<string>): boolean =>
  normalizeOptionalText(a) === normalizeOptionalText(b);

const datesEqual = (a: Date, b: Date): boolean => a.getTime() === b.getTime();

export const pickInvoicePatchSnapshot = (
  invoice: InvoiceInsert | InvoiceSelect
): InvoicePatchSnapshot => ({
  clientId: invoice.clientId,
  discount: invoice.discount,
  dueDate: invoice.dueDate,
  invoiceNumber: invoice.invoiceNumber,
  invoiceStatus: invoice.invoiceStatus ?? "draft",
  issueDate: invoice.issueDate,
  notes: invoice.notes ?? null,
  subject: invoice.subject,
  terms: invoice.terms ?? null,
});

const computeInvoicePatchDelta = (
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
      amount: item.amount,
      description: String(item.description ?? "").trim(),
      id: item.id ?? "",
      quantity: item.quantity,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
  return JSON.stringify(rows);
};

type EditableInvoice = NewInvoice & { id: CursorId };

interface AssertEditReadyInput {
  baselineInvoiceSnapshot: InvoicePatchSnapshot | null;
  baselineLineItemsSnapshot: string | null;
  formReady: boolean;
  invoiceId?: CursorId;
}

type AssertEditReadyResult = Result<{
  baselineInvoiceSnapshot: InvoicePatchSnapshot;
  baselineLineItemsSnapshot: string;
  invoiceId: CursorId;
}>;

export const assertEditReady = ({
  formReady,
  baselineInvoiceSnapshot,
  baselineLineItemsSnapshot,
  invoiceId,
}: AssertEditReadyInput): AssertEditReadyResult => {
  if (!formReady) {
    return err({ message: "Still loading invoice" });
  }

  if (
    baselineInvoiceSnapshot === null ||
    baselineLineItemsSnapshot === null ||
    !invoiceId
  ) {
    return err({ message: "Invoice not ready" });
  }

  return ok({
    baselineInvoiceSnapshot,
    baselineLineItemsSnapshot,
    invoiceId,
  });
};

interface BuildEditPatchInput {
  baselineInvoiceSnapshot: InvoicePatchSnapshot;
  baselineLineItemsSnapshot: string;
  clientId: CursorId;
  invoice: EditableInvoice;
  lineItems: Array<NewLineItemWithId | LineItemEditRow>;
  normalizeLineItems: (
    items: Array<NewLineItemWithId | LineItemEditRow>
  ) => LineItemInsert[];
}

interface EditPatchResult {
  delta: InvoiceUpdate;
  invoiceUnchanged: boolean;
  lineItemsUnchanged: boolean;
  normalizedLineItems: LineItemInsert[];
  unchanged: boolean;
}

export const buildEditPatch = ({
  invoice,
  clientId,
  lineItems,
  baselineInvoiceSnapshot,
  baselineLineItemsSnapshot,
  normalizeLineItems,
}: BuildEditPatchInput): EditPatchResult => {
  const updatedInvoice = {
    ...invoice,
    clientId,
    dueDate: new Date(invoice.dueDate),
    issueDate: new Date(invoice.issueDate),
  };

  const currentSnapshot = pickInvoicePatchSnapshot(updatedInvoice);
  const delta = computeInvoicePatchDelta(
    baselineInvoiceSnapshot,
    currentSnapshot
  );

  const normalizedLineItems = normalizeLineItems(lineItems);
  const lineItemsSnap =
    serializedNormalizedLineItemsForCompare(normalizedLineItems);

  const invoiceUnchanged = Object.keys(delta).length === 0;
  const lineItemsUnchanged = lineItemsSnap === baselineLineItemsSnapshot;

  return {
    delta,
    invoiceUnchanged,
    lineItemsUnchanged,
    normalizedLineItems,
    unchanged: invoiceUnchanged && lineItemsUnchanged,
  };
};
