import { describe, expect, it } from "bun:test";
import type {
  LineItemEditRow,
  NewLineItemWithId,
} from "#features/line-items/types.ts";
import { normalizeLineItems } from "#features/line-items/utils/line-item-form.ts";
import type { CursorId } from "#lib/types.ts";
import type { NewInvoice } from "../types";
import {
  assertEditReady,
  buildEditPatch,
  computeInvoicePatchDelta,
  pickInvoicePatchSnapshot,
  serializedNormalizedLineItemsForCompare,
  type InvoicePatchSnapshot,
} from "./invoice-diff";

const invoiceId = "11111111-1111-4111-8111-111111111111" as CursorId;
const clientId = "22222222-2222-4222-8222-222222222222" as CursorId;
const otherClientId = "33333333-3333-4333-8333-333333333333" as CursorId;
const issueDate = "2026-01-01";
const dueDate = "2026-01-15";

type EditableInvoice = NewInvoice & { id: CursorId };

const makeInvoice = (over: Partial<EditableInvoice> = {}): EditableInvoice => ({
  clientId,
  discount: 0,
  dueDate,
  id: invoiceId,
  invoiceNumber: "INV-1",
  invoiceStatus: "draft",
  issueDate,
  notes: null,
  subject: "Work",
  terms: null,
  ...over,
});

const snapshotFor = (invoice: EditableInvoice): InvoicePatchSnapshot =>
  pickInvoicePatchSnapshot({
    ...invoice,
    clientId: invoice.clientId ?? clientId,
    dueDate: new Date(invoice.dueDate),
    issueDate: new Date(invoice.issueDate),
  });

const lineItem = (
  over: Partial<{
    amount: number;
    description: string;
    id: CursorId;
    quantity: number;
  }> = {}
) => ({
  amount: 10,
  description: "Labor",
  id: "aaaaaaaa-1111-4111-8111-111111111111" as CursorId,
  quantity: 1,
  ...over,
});

describe("pickInvoicePatchSnapshot", () => {
  it("defaults missing status/notes/terms", () => {
    const invoice = makeInvoice({ notes: undefined, terms: undefined });
    const snapshot = snapshotFor({
      ...invoice,
      invoiceStatus: undefined as unknown as EditableInvoice["invoiceStatus"],
    });

    expect(snapshot.invoiceStatus).toBe("draft");
    expect(snapshot.notes).toBeNull();
    expect(snapshot.terms).toBeNull();
  });
});

describe("computeInvoicePatchDelta", () => {
  it("returns empty delta when snapshots match", () => {
    const baseline = snapshotFor(makeInvoice());
    expect(computeInvoicePatchDelta(baseline, baseline)).toEqual({});
  });

  it("includes changed scalar fields", () => {
    const baseline = snapshotFor(makeInvoice());
    const current = snapshotFor(
      makeInvoice({
        clientId: otherClientId,
        discount: 5,
        invoiceNumber: "INV-2",
        invoiceStatus: "sent",
        subject: "Other",
      })
    );

    expect(computeInvoicePatchDelta(baseline, current)).toEqual({
      clientId: otherClientId,
      discount: 5,
      invoiceNumber: "INV-2",
      invoiceStatus: "sent",
      subject: "Other",
    });
  });

  it("includes date fields only when the timestamp changes", () => {
    const baseline = snapshotFor(makeInvoice());
    const sameDates = snapshotFor(makeInvoice());
    expect(computeInvoicePatchDelta(baseline, sameDates)).toEqual({});

    const current = snapshotFor(
      makeInvoice({ dueDate: "2026-02-01", issueDate: "2026-01-20" })
    );
    const delta = computeInvoicePatchDelta(baseline, current);
    expect(delta.dueDate).toEqual(new Date("2026-02-01"));
    expect(delta.issueDate).toEqual(new Date("2026-01-20"));
  });

  it("treats trimmed terms as equal and emits empty notes when whitespace-only", () => {
    const baseline = snapshotFor(
      makeInvoice({ notes: null, terms: "  Pay  " })
    );
    const current = snapshotFor(makeInvoice({ notes: "   ", terms: "Pay" }));
    expect(computeInvoicePatchDelta(baseline, current)).toEqual({ notes: "" });
  });

  it("includes trimmed notes/terms when the text changes", () => {
    const baseline = snapshotFor(makeInvoice({ notes: "old", terms: null }));
    const current = snapshotFor(
      makeInvoice({ notes: "  new  ", terms: "Net 30" })
    );
    expect(computeInvoicePatchDelta(baseline, current)).toEqual({
      notes: "new",
      terms: "Net 30",
    });
  });

  it("emits empty-string notes when text is cleared to whitespace", () => {
    const baseline = snapshotFor(makeInvoice({ notes: "keep" }));
    const current = snapshotFor(makeInvoice({ notes: "  " }));
    expect(computeInvoicePatchDelta(baseline, current)).toEqual({ notes: "" });
  });
});

describe("serializedNormalizedLineItemsForCompare", () => {
  it("is stable across input order", () => {
    const a = serializedNormalizedLineItemsForCompare([
      lineItem({ id: "b" as CursorId, description: " Beta " }),
      lineItem({ id: "a" as CursorId, amount: 3, description: "Alpha" }),
    ]);
    const b = serializedNormalizedLineItemsForCompare([
      lineItem({ id: "a" as CursorId, amount: 3, description: "Alpha" }),
      lineItem({ id: "b" as CursorId, description: "Beta" }),
    ]);
    expect(a).toBe(b);
  });
});

describe("assertEditReady", () => {
  it("fails while the form is still loading", () => {
    expect(
      assertEditReady({
        baselineInvoiceSnapshot: snapshotFor(makeInvoice()),
        baselineLineItemsSnapshot: "[]",
        formReady: false,
        invoiceId,
      })
    ).toEqual({ message: "Still loading invoice", ok: false });
  });

  it("fails when baselines or id are missing", () => {
    expect(
      assertEditReady({
        baselineInvoiceSnapshot: null,
        baselineLineItemsSnapshot: "[]",
        formReady: true,
        invoiceId,
      })
    ).toEqual({ message: "Invoice not ready", ok: false });

    expect(
      assertEditReady({
        baselineInvoiceSnapshot: snapshotFor(makeInvoice()),
        baselineLineItemsSnapshot: null,
        formReady: true,
        invoiceId,
      })
    ).toEqual({ message: "Invoice not ready", ok: false });

    expect(
      assertEditReady({
        baselineInvoiceSnapshot: snapshotFor(makeInvoice()),
        baselineLineItemsSnapshot: "[]",
        formReady: true,
      })
    ).toEqual({ message: "Invoice not ready", ok: false });
  });

  it("returns snapshots when ready", () => {
    const baselineInvoiceSnapshot = snapshotFor(makeInvoice());
    expect(
      assertEditReady({
        baselineInvoiceSnapshot,
        baselineLineItemsSnapshot: "[]",
        formReady: true,
        invoiceId,
      })
    ).toEqual({
      baselineInvoiceSnapshot,
      baselineLineItemsSnapshot: "[]",
      invoiceId,
      ok: true,
    });
  });
});

describe("buildEditPatch", () => {
  const patchFor = (
    invoice: EditableInvoice,
    items: Array<NewLineItemWithId | LineItemEditRow> = [lineItem()],
    baselineInvoice = snapshotFor(invoice),
    baselineLines = serializedNormalizedLineItemsForCompare(
      normalizeLineItems(items)
    )
  ) =>
    buildEditPatch({
      baselineInvoiceSnapshot: baselineInvoice,
      baselineLineItemsSnapshot: baselineLines,
      clientId: invoice.clientId ?? clientId,
      invoice,
      lineItems: items,
      normalizeLineItems,
    });

  it("marks unchanged invoice and line items", () => {
    const invoice = makeInvoice();
    const patch = patchFor(invoice);
    expect(patch.unchanged).toBe(true);
    expect(patch.invoiceUnchanged).toBe(true);
    expect(patch.lineItemsUnchanged).toBe(true);
    expect(patch.delta).toEqual({});
  });

  it("returns invoice delta without line-item changes", () => {
    const invoice = makeInvoice({ subject: "Updated" });
    const patch = patchFor(
      invoice,
      [lineItem()],
      snapshotFor(makeInvoice()),
      serializedNormalizedLineItemsForCompare(normalizeLineItems([lineItem()]))
    );
    expect(patch.invoiceUnchanged).toBe(false);
    expect(patch.lineItemsUnchanged).toBe(true);
    expect(patch.unchanged).toBe(false);
    expect(patch.delta.subject).toBe("Updated");
  });

  it("detects line-item changes and drops blank rows", () => {
    const invoice = makeInvoice();
    const baselineItems = [lineItem()];
    const patch = patchFor(
      invoice,
      [
        lineItem({ amount: 20, description: "  Labor  " }),
        { amount: 0, description: "   ", id: 1, quantity: 0 },
      ],
      snapshotFor(invoice),
      serializedNormalizedLineItemsForCompare(normalizeLineItems(baselineItems))
    );
    expect(patch.invoiceUnchanged).toBe(true);
    expect(patch.lineItemsUnchanged).toBe(false);
    expect(patch.normalizedLineItems).toEqual([
      {
        amount: 20,
        description: "  Labor  ",
        id: lineItem().id,
        quantity: 1,
      },
    ]);
  });
});
