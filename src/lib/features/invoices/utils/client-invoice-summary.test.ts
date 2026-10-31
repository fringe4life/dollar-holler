import { describe, expect, it } from "bun:test";
import {
  applyDeletedInvoiceToSummary,
  applySentInvoiceToSummary,
  type ClientInvoiceSummaryFinal,
} from "./client-invoice-summary.ts";

const base = (): ClientInvoiceSummaryFinal => ({
  draft: 100,
  draftCount: 1,
  grandTotal: 425,
  outstanding: 200,
  outstandingCount: 1,
  overdue: 50,
  overdueCount: 1,
  paid: 75,
  paidCount: 1,
});

describe("applySentInvoiceToSummary", () => {
  it("moves draft money and count into outstanding when not overdue", () => {
    const dueDate = new Date(Date.now() + 86_400_000);
    expect(applySentInvoiceToSummary(base(), { dueDate, total: 100 })).toEqual({
      draft: 0,
      draftCount: 0,
      grandTotal: 425,
      outstanding: 300,
      outstandingCount: 2,
      overdue: 50,
      overdueCount: 1,
      paid: 75,
      paidCount: 1,
    });
  });

  it("moves draft money and count into overdue when past due", () => {
    const dueDate = new Date(Date.now() - 86_400_000);
    expect(applySentInvoiceToSummary(base(), { dueDate, total: 100 })).toEqual({
      draft: 0,
      draftCount: 0,
      grandTotal: 425,
      outstanding: 200,
      outstandingCount: 1,
      overdue: 150,
      overdueCount: 2,
      paid: 75,
      paidCount: 1,
    });
  });
});

describe("applyDeletedInvoiceToSummary", () => {
  it("decrements money and count for the matching bucket", () => {
    expect(
      applyDeletedInvoiceToSummary(base(), {
        dueDate: new Date(Date.now() - 86_400_000),
        invoiceStatus: "sent",
        total: 50,
      })
    ).toEqual({
      draft: 100,
      draftCount: 1,
      grandTotal: 375,
      outstanding: 200,
      outstandingCount: 1,
      overdue: 0,
      overdueCount: 0,
      paid: 75,
      paidCount: 1,
    });
  });
});
