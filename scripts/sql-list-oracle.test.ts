/**
 * Integration: local Miniflare D1 must match scripts/fixtures/sql-list-oracle-golden.json.
 *
 * Requires seeded local D1 (same counts as golden). After intentional reseed:
 *   bun run bench:sql-list -- --write-oracle
 */

import { describe, expect, it } from "bun:test";
import type { D1Database } from "@cloudflare/workers-types";
import { getPlatformProxy } from "wrangler";
import {
  formatOracleVerifyFailure,
  readOracleGolden,
  verifyOracleAgainstGolden,
} from "./sql-list-oracle.ts";

describe("sql-list-oracle vs local D1 seed", () => {
  it("matches golden hash for list/money/summary fixture pack", async () => {
    const golden = readOracleGolden();
    expect(golden.hash).toHaveLength(64);
    expect(golden.results.invoiceListPage.length).toBeGreaterThan(0);

    const proxy = await getPlatformProxy<{ DB: D1Database }>({
      persist: true,
      remoteBindings: false,
    });
    try {
      const d1 = proxy.env.DB;
      expect(d1).toBeDefined();
      const result = await verifyOracleAgainstGolden(d1!, golden);
      if (!result.ok) {
        throw new Error(formatOracleVerifyFailure(result));
      }
      expect(result.hash).toBe(golden.hash);
    } finally {
      await proxy.dispose();
    }
  }, 60_000);
});
