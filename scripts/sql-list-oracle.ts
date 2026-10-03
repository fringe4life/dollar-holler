/**
 * Result-hash oracle for invoice/client list + client summary on local D1.
 *
 * Fixture pack: first auth user, page of clients (limit+1), focus = newest client.
 * Canonical ordered ids + money totals → SHA-256. Group B (#122/#123) keeps a
 * rewrite only when this hash still matches (and bench improves).
 *
 * Usage (via harness):
 *   bun run bench:sql-list -- --write-oracle   # capture golden after seed
 *   bun run bench:sql-list -- --oracle         # fail on mismatch
 *   bun test scripts/sql-list-oracle.test.ts
 *
 * @see docs/agent-sql-performance-research.md (oracle playbook)
 * @see docs/benchmarks/sql-list-oracle.md
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { D1Database } from "@cloudflare/workers-types";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import {
  invoiceTotalFromSubtotalSql,
  lineItemsSubtotalSqlForInvoiceId,
} from "#lib/features/invoices/queries/invoice-list-helpers.ts";
import { DEFAULT_LIMIT } from "#lib/features/pagination/constants.ts";
import type { CursorId } from "#lib/schemas/cursor-id.ts";
import { createDb, type AppDatabase } from "#lib/server/db/create-db.ts";
import {
  clients as clientsTable,
  invoices as invoicesTable,
  lineItems as lineItemsTable,
} from "#lib/server/db/schema.ts";

const PAGE = DEFAULT_LIMIT;
/** Cursor lists fetch limit+1 to detect next page. */
const ORACLE_TAKE = PAGE + 1;

const HERE = dirname(fileURLToPath(import.meta.url));
export const ORACLE_GOLDEN_PATH = join(
  HERE,
  "fixtures",
  "sql-list-oracle-golden.json"
);

const ORACLE_VERSION = 1 as const;

type OracleSeedCounts = {
  users: number;
  clients: number;
  invoices: number;
  lineItems: number;
  settings: number;
};

type OracleFixture = {
  userId: string;
  clientIds: CursorId[];
  focusClientId: CursorId;
  /** Frozen clock for outstanding vs overdue CASE buckets. */
  nowMs: number;
  listLimit: number;
  take: number;
};

type OracleInvoiceListRow = {
  id: string;
  invoiceNumber: string;
  invoiceStatus: string;
  discount: number;
  subtotal: number;
  total: number;
};

type OracleClientMoneyRow = {
  clientId: string;
  balance: number;
  received: number;
};

type OracleClientSummary = {
  draft: number;
  outstanding: number;
  overdue: number;
  paid: number;
  grandTotal: number;
};

/** Canonical money outcomes — hashed. Order is part of the contract. */
export type OracleResults = {
  invoiceListPage: OracleInvoiceListRow[];
  clientsMoney: OracleClientMoneyRow[];
  clientSummary: OracleClientSummary;
  invoiceListForClient: OracleInvoiceListRow[];
};

export type OracleGolden = {
  version: typeof ORACLE_VERSION;
  seedCounts: OracleSeedCounts;
  fixture: OracleFixture;
  results: OracleResults;
  /** SHA-256 hex of stableStringify(results). */
  hash: string;
};

const moneyInt = (n: unknown): number => Math.round(Number(n ?? 0));

/** Deterministic JSON for hashing (sorted keys, no whitespace variance). */
export const stableStringify = (value: unknown): string => {
  const normalize = (v: unknown): unknown => {
    if (v === null || typeof v !== "object") {
      return v;
    }
    if (Array.isArray(v)) {
      return v.map(normalize);
    }
    const obj = v as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      out[key] = normalize(obj[key]);
    }
    return out;
  };
  return JSON.stringify(normalize(value));
};

export const hashOracleResults = (results: OracleResults): string =>
  createHash("sha256").update(stableStringify(results)).digest("hex");

function invoiceListSelect(db: AppDatabase, userId: string) {
  // leftJoin clients so drizzle qualifies invoices.id in the correlated SUM
  // (bare `id` inside FROM line_items binds to line_items.id → always 0).
  return db
    .select({
      discount: invoicesTable.discount,
      id: invoicesTable.id,
      invoiceNumber: invoicesTable.invoiceNumber,
      invoiceStatus: invoicesTable.invoiceStatus,
      subtotal: lineItemsSubtotalSqlForInvoiceId(invoicesTable.id).as(
        "subtotal"
      ),
    })
    .from(invoicesTable)
    .leftJoin(clientsTable, eq(clientsTable.id, invoicesTable.clientId))
    .where(eq(invoicesTable.userId, userId))
    .orderBy(desc(invoicesTable.id))
    .limit(ORACLE_TAKE);
}

function invoiceListForClientSelect(
  db: AppDatabase,
  userId: string,
  clientId: CursorId
) {
  return db
    .select({
      discount: invoicesTable.discount,
      id: invoicesTable.id,
      invoiceNumber: invoicesTable.invoiceNumber,
      invoiceStatus: invoicesTable.invoiceStatus,
      subtotal: lineItemsSubtotalSqlForInvoiceId(invoicesTable.id).as(
        "subtotal"
      ),
    })
    .from(invoicesTable)
    .leftJoin(clientsTable, eq(clientsTable.id, invoicesTable.clientId))
    .where(
      and(
        eq(invoicesTable.userId, userId),
        eq(invoicesTable.clientId, clientId)
      )
    )
    .orderBy(desc(invoicesTable.id))
    .limit(ORACLE_TAKE);
}

function clientsPageSelect(db: AppDatabase, userId: string) {
  return db
    .select({ id: clientsTable.id })
    .from(clientsTable)
    .where(eq(clientsTable.userId, userId))
    .orderBy(desc(clientsTable.id))
    .limit(ORACLE_TAKE);
}

function clientReceivedBalanceQuery(
  db: AppDatabase,
  userId: string,
  clientIds: CursorId[]
) {
  // Intentionally mirrors production/harness invoice_totals CTE algebra.
  // fallow-ignore-next-line code-duplication
  const invoiceTotals = db.$with("invoice_totals").as(
    db
      .select({
        clientId: invoicesTable.clientId,
        id: invoicesTable.id,
        invoiceStatus: invoicesTable.invoiceStatus,
        total: invoiceTotalFromSubtotalSql(
          sql`SUM(${lineItemsTable.amount})`,
          invoicesTable.discount
        ).as("total"),
      })
      .from(invoicesTable)
      .leftJoin(lineItemsTable, eq(lineItemsTable.invoiceId, invoicesTable.id))
      .where(
        and(
          eq(invoicesTable.userId, userId),
          inArray(invoicesTable.clientId, [...clientIds])
        )
      )
      .groupBy(invoicesTable.id)
  );

  return db
    .with(invoiceTotals)
    .select({
      balance:
        sql<number>`COALESCE(SUM(CASE WHEN ${invoiceTotals.invoiceStatus} IS NULL OR ${invoiceTotals.invoiceStatus} <> 'paid' THEN ${invoiceTotals.total} ELSE 0 END), 0)`.as(
          "balance"
        ),
      clientId: invoiceTotals.clientId,
      received:
        sql<number>`COALESCE(SUM(CASE WHEN ${invoiceTotals.invoiceStatus} = 'paid' THEN ${invoiceTotals.total} ELSE 0 END), 0)`.as(
          "received"
        ),
    })
    .from(invoiceTotals)
    .groupBy(invoiceTotals.clientId);
}

function clientInvoiceSummaryQuery(
  db: AppDatabase,
  userId: string,
  clientId: CursorId,
  nowMs: number
) {
  const invoiceTotals = db.$with("invoice_totals").as(
    db
      .select({
        dueDate: invoicesTable.dueDate,
        id: invoicesTable.id,
        invoiceStatus: invoicesTable.invoiceStatus,
        total: invoiceTotalFromSubtotalSql(
          sql`SUM(${lineItemsTable.amount})`,
          invoicesTable.discount
        ).as("total"),
      })
      .from(invoicesTable)
      .leftJoin(lineItemsTable, eq(lineItemsTable.invoiceId, invoicesTable.id))
      .where(
        and(
          eq(invoicesTable.userId, userId),
          eq(invoicesTable.clientId, clientId)
        )
      )
      .groupBy(invoicesTable.id)
  );

  return db
    .with(invoiceTotals)
    .select({
      draft:
        sql<number>`COALESCE(SUM(CASE WHEN ${invoiceTotals.invoiceStatus} = 'draft' THEN ${invoiceTotals.total} ELSE 0 END), 0)`.as(
          "draft"
        ),
      outstanding:
        sql<number>`COALESCE(SUM(CASE WHEN ${invoiceTotals.invoiceStatus} = 'sent' AND ${invoiceTotals.dueDate} >= ${nowMs} THEN ${invoiceTotals.total} ELSE 0 END), 0)`.as(
          "outstanding"
        ),
      overdue:
        sql<number>`COALESCE(SUM(CASE WHEN ${invoiceTotals.invoiceStatus} = 'sent' AND ${invoiceTotals.dueDate} < ${nowMs} THEN ${invoiceTotals.total} ELSE 0 END), 0)`.as(
          "overdue"
        ),
      paid: sql<number>`COALESCE(SUM(CASE WHEN ${invoiceTotals.invoiceStatus} = 'paid' THEN ${invoiceTotals.total} ELSE 0 END), 0)`.as(
        "paid"
      ),
    })
    .from(invoiceTotals);
}

const toInvoiceListRowsWithSubtotal = (
  rows: Array<{
    discount: unknown;
    id: string;
    invoiceNumber: string;
    invoiceStatus: string | null;
    subtotal: unknown;
  }>
): OracleInvoiceListRow[] =>
  rows.map((row) => {
    const subtotal = moneyInt(row.subtotal);
    const discount = moneyInt(row.discount);
    const total = Math.round(subtotal * (1 - discount / 100));
    return {
      discount,
      id: row.id,
      invoiceNumber: row.invoiceNumber,
      invoiceStatus: String(row.invoiceStatus ?? ""),
      subtotal,
      total,
    };
  });

async function countOracleSeedFromD1(
  d1: D1Database
): Promise<OracleSeedCounts> {
  const count = async (table: string): Promise<number> => {
    const row = await d1
      .prepare(`SELECT COUNT(*) AS c FROM ${table}`)
      .first<{ c: number }>();
    return row?.c ?? 0;
  };
  const [users, clients, invoices, lineItems, settings] = await Promise.all([
    count("user"),
    count("clients"),
    count("invoices"),
    count("line_items"),
    count("settings"),
  ]);
  return { users, clients, invoices, lineItems, settings };
}

/**
 * Resolve fixture pack from current local seed.
 * `nowMs` optional — pass golden.fixture.nowMs on verify so outstanding/overdue stable.
 */
async function resolveOracleFixture(
  db: AppDatabase,
  nowMs: number = Date.now()
): Promise<OracleFixture> {
  const [seedUser] = await db.query.user.findMany({ limit: 1 });
  if (!seedUser) {
    throw new Error("No users in local D1 — create auth users then db:seed");
  }
  const userId = seedUser.id;

  const pageClients = await clientsPageSelect(db, userId);
  if (pageClients.length === 0) {
    throw new Error("No clients for seed user — run bun run db:seed");
  }

  return {
    userId,
    clientIds: pageClients.map((c) => c.id),
    focusClientId: pageClients[0]!.id,
    nowMs,
    listLimit: PAGE,
    take: ORACLE_TAKE,
  };
}

async function collectOracleResults(
  db: AppDatabase,
  fixture: OracleFixture
): Promise<OracleResults> {
  const { userId, clientIds, focusClientId, nowMs } = fixture;

  const listRows = await invoiceListSelect(db, userId);
  const listForClientRows = await invoiceListForClientSelect(
    db,
    userId,
    focusClientId
  );
  const moneyRows = await clientReceivedBalanceQuery(db, userId, clientIds);
  const [summaryRow] = await clientInvoiceSummaryQuery(
    db,
    userId,
    focusClientId,
    nowMs
  );

  const moneyById = new Map(
    moneyRows.map((row) => [
      row.clientId,
      {
        clientId: row.clientId,
        balance: moneyInt(row.balance),
        received: moneyInt(row.received),
      } satisfies OracleClientMoneyRow,
    ])
  );

  // Page order (id desc) with zero-fill for clients that have no invoices.
  const clientsMoney: OracleClientMoneyRow[] = clientIds.map(
    (id) => moneyById.get(id) ?? { clientId: id, balance: 0, received: 0 }
  );

  const draft = moneyInt(summaryRow?.draft);
  const outstanding = moneyInt(summaryRow?.outstanding);
  const overdue = moneyInt(summaryRow?.overdue);
  const paid = moneyInt(summaryRow?.paid);

  return {
    invoiceListPage: toInvoiceListRowsWithSubtotal(listRows),
    clientsMoney,
    clientSummary: {
      draft,
      outstanding,
      overdue,
      paid,
      grandTotal: draft + outstanding + overdue + paid,
    },
    invoiceListForClient: toInvoiceListRowsWithSubtotal(listForClientRows),
  };
}

export async function buildOracleGolden(
  d1: D1Database,
  options: { nowMs?: number } = {}
): Promise<OracleGolden> {
  const db = createDb(d1);
  const seedCounts = await countOracleSeedFromD1(d1);
  const fixture = await resolveOracleFixture(db, options.nowMs ?? Date.now());
  const results = await collectOracleResults(db, fixture);
  const hash = hashOracleResults(results);
  return {
    version: ORACLE_VERSION,
    seedCounts,
    fixture,
    results,
    hash,
  };
}

export const readOracleGolden = (
  path: string = ORACLE_GOLDEN_PATH
): OracleGolden => {
  const raw = readFileSync(path, "utf8");
  return JSON.parse(raw) as OracleGolden;
};

export const writeOracleGolden = (
  golden: OracleGolden,
  path: string = ORACLE_GOLDEN_PATH
): void => {
  writeFileSync(path, `${JSON.stringify(golden, null, 2)}\n`, "utf8");
};

export type OracleVerifyOk = {
  ok: true;
  hash: string;
  seedCounts: OracleSeedCounts;
};

export type OracleVerifyFail = {
  ok: false;
  reason: string;
  expectedHash?: string;
  actualHash?: string;
  expectedResults?: OracleResults;
  actualResults?: OracleResults;
};

export type OracleVerifyResult = OracleVerifyOk | OracleVerifyFail;

const seedCountsEqual = (a: OracleSeedCounts, b: OracleSeedCounts): boolean =>
  a.users === b.users &&
  a.clients === b.clients &&
  a.invoices === b.invoices &&
  a.lineItems === b.lineItems &&
  a.settings === b.settings;

/**
 * Re-run oracle queries with golden's frozen nowMs + compare hash.
 * Seed-count drift → fail with reseed/--write-oracle hint (ids change on reseed).
 */
export async function verifyOracleAgainstGolden(
  d1: D1Database,
  golden: OracleGolden = readOracleGolden()
): Promise<OracleVerifyResult> {
  const seedCounts = await countOracleSeedFromD1(d1);
  if (!seedCountsEqual(seedCounts, golden.seedCounts)) {
    return {
      ok: false,
      reason: `Seed counts drifted (got ${JSON.stringify(seedCounts)}, golden ${JSON.stringify(golden.seedCounts)}). Re-seed then bun run bench:sql-list -- --write-oracle`,
    };
  }

  const db = createDb(d1);
  // Same user/client pack as golden write when seed unchanged; freeze nowMs.
  const fixture = await resolveOracleFixture(db, golden.fixture.nowMs);

  if (
    fixture.userId !== golden.fixture.userId ||
    fixture.focusClientId !== golden.fixture.focusClientId
  ) {
    return {
      ok: false,
      reason:
        "Fixture user/client ids changed (reseed or different local D1). Run bun run bench:sql-list -- --write-oracle after intentional seed change.",
    };
  }

  const results = await collectOracleResults(db, fixture);
  const actualHash = hashOracleResults(results);
  if (actualHash !== golden.hash) {
    return {
      ok: false,
      reason:
        "Oracle result hash mismatch — rewrite changed list/summary totals",
      expectedHash: golden.hash,
      actualHash,
      expectedResults: golden.results,
      actualResults: results,
    };
  }

  // Belt: also compare canonical JSON (catches hash collision / golden edit).
  if (stableStringify(results) !== stableStringify(golden.results)) {
    return {
      ok: false,
      reason: "Oracle results JSON mismatch despite hash claim",
      expectedHash: golden.hash,
      actualHash,
      expectedResults: golden.results,
      actualResults: results,
    };
  }

  return { ok: true, hash: actualHash, seedCounts };
}

export function formatOracleVerifyFailure(fail: OracleVerifyFail): string {
  const lines = [`Oracle failed: ${fail.reason}`];
  if (fail.expectedHash && fail.actualHash) {
    lines.push(`  expected hash: ${fail.expectedHash}`);
    lines.push(`  actual hash:   ${fail.actualHash}`);
  }
  if (fail.expectedResults && fail.actualResults) {
    lines.push(`  expected results: ${stableStringify(fail.expectedResults)}`);
    lines.push(`  actual results:   ${stableStringify(fail.actualResults)}`);
  }
  return lines.join("\n");
}
