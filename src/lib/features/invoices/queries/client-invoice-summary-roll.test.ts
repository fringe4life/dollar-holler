import { describe, expect, it } from "bun:test";
import {
  rollClientInvoiceSummary,
  type ClientInvoiceTotalRow,
} from "./client-invoice-summary-roll.ts";
import type { CursorId } from "#lib/schemas/cursor-id.ts";

const id = (n: string) => n as CursorId;

const row = (
  partial: Omit<ClientInvoiceTotalRow, "subtotal"> & { subtotal?: number }
): ClientInvoiceTotalRow => ({
  subtotal: partial.subtotal ?? partial.total,
  ...partial,
});

describe("rollClientInvoiceSummary", () => {
  const nowMs = Date.parse("2026-10-01T00:00:00.000Z");

  it("buckets draft / paid / outstanding / overdue by status and dueDate", () => {
    const rows = [
      row({
        dueDate: new Date(nowMs + 86_400_000),
        id: id("a"),
        invoiceStatus: "draft",
        total: 100,
      }),
      row({
        dueDate: new Date(nowMs + 86_400_000),
        id: id("b"),
        invoiceStatus: "sent",
        total: 200,
      }),
      row({
        dueDate: new Date(nowMs - 86_400_000),
        id: id("c"),
        invoiceStatus: "sent",
        total: 50,
      }),
      row({
        dueDate: new Date(nowMs),
        id: id("d"),
        invoiceStatus: "paid",
        total: 75,
      }),
    ];

    expect(rollClientInvoiceSummary(rows, nowMs)).toEqual({
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
  });

  it("treats dueDate === nowMs as outstanding (matches SQL >=)", () => {
    const rows = [
      row({
        dueDate: new Date(nowMs),
        id: id("e"),
        invoiceStatus: "sent",
        total: 10,
      }),
    ];
    expect(rollClientInvoiceSummary(rows, nowMs)).toEqual({
      draft: 0,
      draftCount: 0,
      grandTotal: 10,
      outstanding: 10,
      outstandingCount: 1,
      overdue: 0,
      overdueCount: 0,
      paid: 0,
      paidCount: 0,
    });
  });

  it("buckets null / unknown status as draft", () => {
    const rows = [
      row({
        dueDate: new Date(nowMs),
        id: id("f"),
        invoiceStatus: null,
        total: 999,
      }),
      row({
        dueDate: new Date(nowMs),
        id: id("f2"),
        invoiceStatus: "weird",
        total: 1,
      }),
    ];
    expect(rollClientInvoiceSummary(rows, nowMs)).toEqual({
      draft: 1000,
      draftCount: 2,
      grandTotal: 1000,
      outstanding: 0,
      outstandingCount: 0,
      overdue: 0,
      overdueCount: 0,
      paid: 0,
      paidCount: 0,
    });
  });

  it("counts multiple invoices in the same bucket", () => {
    const rows = [
      row({
        dueDate: new Date(nowMs - 1),
        id: id("g"),
        invoiceStatus: "sent",
        total: 10,
      }),
      row({
        dueDate: new Date(nowMs - 2),
        id: id("h"),
        invoiceStatus: "sent",
        total: 20,
      }),
    ];
    expect(rollClientInvoiceSummary(rows, nowMs)).toEqual({
      draft: 0,
      draftCount: 0,
      grandTotal: 30,
      outstanding: 0,
      outstandingCount: 0,
      overdue: 30,
      overdueCount: 2,
      paid: 0,
      paidCount: 0,
    });
  });
});
