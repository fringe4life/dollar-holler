import { describe, expect, it } from "bun:test";
import {
  hashOracleResults,
  type OracleResults,
  stableStringify,
} from "./sql-list-oracle.ts";

const SAMPLE_RESULTS: OracleResults = {
  invoiceListPage: [
    {
      id: "inv_b",
      invoiceNumber: "2",
      invoiceStatus: "sent",
      discount: 10,
      subtotal: 1000,
      total: 900,
    },
    {
      id: "inv_a",
      invoiceNumber: "1",
      invoiceStatus: "paid",
      discount: 0,
      subtotal: 500,
      total: 500,
    },
  ],
  clientsMoney: [
    { clientId: "cli_z", balance: 900, received: 500 },
    { clientId: "cli_y", balance: 0, received: 0 },
  ],
  clientSummary: {
    draft: 0,
    outstanding: 900,
    overdue: 0,
    paid: 500,
    grandTotal: 1400,
  },
  invoiceListForClient: [
    {
      id: "inv_b",
      invoiceNumber: "2",
      invoiceStatus: "sent",
      discount: 10,
      subtotal: 1000,
      total: 900,
    },
  ],
};

describe("sql-list-oracle hashing", () => {
  it("stableStringify sorts object keys", () => {
    expect(stableStringify({ b: 1, a: 2 })).toBe('{"a":2,"b":1}');
  });

  it("hashOracleResults is stable for same payload", () => {
    const a = hashOracleResults(SAMPLE_RESULTS);
    const b = hashOracleResults(structuredClone(SAMPLE_RESULTS));
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
  });

  it("hashOracleResults changes when a total drifts", () => {
    const baseline = hashOracleResults(SAMPLE_RESULTS);
    const drifted: OracleResults = {
      ...SAMPLE_RESULTS,
      clientSummary: {
        ...SAMPLE_RESULTS.clientSummary,
        paid: SAMPLE_RESULTS.clientSummary.paid + 1,
        grandTotal: SAMPLE_RESULTS.clientSummary.grandTotal + 1,
      },
    };
    expect(hashOracleResults(drifted)).not.toBe(baseline);
  });
});
