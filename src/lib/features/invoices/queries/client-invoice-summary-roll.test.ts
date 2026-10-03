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
      grandTotal: 425,
      outstanding: 200,
      overdue: 50,
      paid: 75,
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
      grandTotal: 10,
      outstanding: 10,
      overdue: 0,
      paid: 0,
    });
  });

  it("ignores null / unknown status (same as SQL CASE buckets)", () => {
    const rows = [
      row({
        dueDate: new Date(nowMs),
        id: id("f"),
        invoiceStatus: null,
        total: 999,
      }),
    ];
    expect(rollClientInvoiceSummary(rows, nowMs)).toEqual({
      draft: 0,
      grandTotal: 0,
      outstanding: 0,
      overdue: 0,
      paid: 0,
    });
  });
});
