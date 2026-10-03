import { describe, expect, it } from "bun:test";
import {
  invoiceTotalFromSubtotal,
  mapRowsWithTotal,
} from "./invoice-list-helpers.ts";

describe("invoiceTotalFromSubtotal", () => {
  it("rounds the product, not the subtotal first", () => {
    // SUM 1.6 at 10% off → 1.44 → 1. Rounding 1.6 to 2 first yields 2.
    expect(invoiceTotalFromSubtotal(1.6, 10)).toBe(1);
    expect(
      mapRowsWithTotal([{ discount: 10, subtotal: 1.6 }]).map(
        (row) => row.total
      )
    ).toEqual([1]);
  });
});
