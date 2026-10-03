/**
 * Throwaway BEFORE/AFTER harness for invoice/client list SQL on local D1.
 *
 * Opens Miniflare D1 via getPlatformProxy({ persist: true }) like seed.ts.
 * Production fetch* helpers import `db` from cloudflare:workers — unavailable
 * under Bun scripts — so this times matching drizzle shapes via createDb(D1)
 * and notes the gap.
 *
 * Usage: bun run bench:sql-list
 * Optional: bun run bench:sql-list -- --json > /tmp/baseline.json
 * Oracle:  bun run bench:sql-list -- --oracle
 *          bun run bench:sql-list -- --write-oracle
 * @see ./sql-list-oracle.ts · docs/benchmarks/sql-list-oracle.md
 */

import type { D1Database } from "@cloudflare/workers-types";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getPlatformProxy } from "wrangler";
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
import {
  buildOracleGolden,
  formatOracleVerifyFailure,
  ORACLE_GOLDEN_PATH,
  verifyOracleAgainstGolden,
  writeOracleGolden,
} from "./sql-list-oracle.ts";

const WARM = 2;
const SAMPLES = 7;
const PAGE = DEFAULT_LIMIT; // 10
/** Cursor lists fetch limit+1 to detect next page. */
const TAKE = PAGE + 1;

const hasFlag = (flag: string): boolean =>
  process.argv.some((arg) => arg === flag);

const asJson = hasFlag("--json");
const runOracle = hasFlag("--oracle");
const writeOracle = hasFlag("--write-oracle");

type Timing = {
  label: string;
  rtts: number;
  samplesMs: number[];
  warmDiscarded: number;
  medianMs: number;
  meanMs: number;
  minMs: number;
  maxMs: number;
};

type ExplainRow = Record<string, unknown>;

type QueryCapture = {
  label: string;
  sql: string;
  params: unknown[];
  explain: ExplainRow[];
  timing: Timing;
};

type SeedCounts = {
  users: number;
  clients: number;
  invoices: number;
  lineItems: number;
  settings: number;
};

type Fixture = {
  /** Better Auth `user.id` — plain text, not a CursorId brand. */
  userId: string;
  clientIds: CursorId[];
  focusClientId: CursorId;
  nowMs: number;
};

type BaselineReport = {
  machine: {
    platform: string;
    arch: string;
    bun: string;
    cpus: number | null;
    date: string;
  };
  seedCounts: SeedCounts;
  fixture: {
    userIdPrefix: string;
    focusClientIdPrefix: string;
    pageClientCount: number;
    listLimit: number;
    take: number;
  };
  gap: {
    realFetchImport: string;
    rqbExplain: string;
  };
  rqbFindManyTiming: Timing;
  /** #123 discard candidate timing (2 RTT batch). */
  rqbBatchDiscardTiming: Timing;
  clientsCombinedTiming: Timing;
  captures: QueryCapture[];
};

const median = (xs: number[]): number => {
  const sorted = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1]! + sorted[mid]!) / 2
    : sorted[mid]!;
};

const mean = (xs: number[]): number =>
  xs.reduce((a, b) => a + b, 0) / Math.max(xs.length, 1);

const roundMs = (n: number): number => Math.round(n * 100) / 100;

async function timeFn(
  label: string,
  rtts: number,
  fn: () => Promise<unknown>
): Promise<Timing> {
  for (let i = 0; i < WARM; i++) {
    await fn();
  }
  const samplesMs: number[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const t0 = performance.now();
    await fn();
    samplesMs.push(performance.now() - t0);
  }
  return {
    label,
    rtts,
    samplesMs: samplesMs.map(roundMs),
    warmDiscarded: WARM,
    medianMs: roundMs(median(samplesMs)),
    meanMs: roundMs(mean(samplesMs)),
    minMs: roundMs(Math.min(...samplesMs)),
    maxMs: roundMs(Math.max(...samplesMs)),
  };
}

async function explainQueryPlan(
  d1: D1Database,
  querySql: string,
  params: unknown[]
): Promise<ExplainRow[]> {
  const stmt = d1.prepare(`EXPLAIN QUERY PLAN ${querySql}`);
  const bound =
    params.length > 0
      ? stmt.bind(...(params as (string | number | null)[]))
      : stmt;
  const result = await bound.all();
  return (result.results ?? []) as ExplainRow[];
}

async function countTable(d1: D1Database, table: string): Promise<number> {
  const row = await d1
    .prepare(`SELECT COUNT(*) AS c FROM ${table}`)
    .first<{ c: number }>();
  return row?.c ?? 0;
}

async function loadSeedCounts(d1: D1Database): Promise<SeedCounts> {
  const [users, clients, invoices, lineItems, settings] = await Promise.all([
    countTable(d1, "user"),
    countTable(d1, "clients"),
    countTable(d1, "invoices"),
    countTable(d1, "line_items"),
    countTable(d1, "settings"),
  ]);
  return { users, clients, invoices, lineItems, settings };
}

function invoiceListPageSelect(db: AppDatabase, userId: string) {
  return db
    .select({
      clientName: clientsTable.name,
      discount: invoicesTable.discount,
      id: invoicesTable.id,
      invoiceNumber: invoicesTable.invoiceNumber,
      invoiceStatus: invoicesTable.invoiceStatus,
      subject: invoicesTable.subject,
    })
    .from(invoicesTable)
    .leftJoin(clientsTable, eq(clientsTable.id, invoicesTable.clientId))
    .where(eq(invoicesTable.userId, userId))
    .orderBy(desc(invoicesTable.id))
    .limit(TAKE);
}

/** BEFORE-shape: correlated SUM (keep for Δ vs #123 batch). */
function invoiceListCorrelatedSelect(db: AppDatabase, userId: string) {
  return db
    .select({
      clientName: clientsTable.name,
      discount: invoicesTable.discount,
      id: invoicesTable.id,
      invoiceNumber: invoicesTable.invoiceNumber,
      invoiceStatus: invoicesTable.invoiceStatus,
      subject: invoicesTable.subject,
      subtotal: lineItemsSubtotalSqlForInvoiceId(invoicesTable.id),
    })
    .from(invoicesTable)
    .leftJoin(clientsTable, eq(clientsTable.id, invoicesTable.clientId))
    .where(eq(invoicesTable.userId, userId))
    .orderBy(desc(invoicesTable.id))
    .limit(TAKE);
}

function lineItemSubtotalsForIdsQuery(db: AppDatabase, invoiceIds: CursorId[]) {
  return db
    .select({
      invoiceId: lineItemsTable.invoiceId,
      subtotal: sql<number>`COALESCE(SUM(${lineItemsTable.amount}), 0)`.as(
        "subtotal"
      ),
    })
    .from(lineItemsTable)
    .where(inArray(lineItemsTable.invoiceId, [...invoiceIds]))
    .groupBy(lineItemsTable.invoiceId);
}

function invoiceListForClientPageSelect(
  db: AppDatabase,
  userId: string,
  clientId: CursorId
) {
  return db
    .select({
      clientName: clientsTable.name,
      discount: invoicesTable.discount,
      id: invoicesTable.id,
      invoiceNumber: invoicesTable.invoiceNumber,
      invoiceStatus: invoicesTable.invoiceStatus,
      subject: invoicesTable.subject,
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
    .limit(TAKE);
}

function clientsPageSelect(db: AppDatabase, userId: string) {
  return db
    .select()
    .from(clientsTable)
    .where(eq(clientsTable.userId, userId))
    .orderBy(desc(clientsTable.id))
    .limit(TAKE);
}

function clientReceivedBalanceQuery(
  db: AppDatabase,
  userId: string,
  clientIds: CursorId[]
) {
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

/** #122 shared money CTE — per-invoice subtotal + SQL ROUND total (JS rolls summary). */
function clientInvoiceTotalRowsQuery(
  db: AppDatabase,
  userId: string,
  clientId: CursorId
) {
  const invoiceTotals = db.$with("invoice_totals").as(
    db
      .select({
        dueDate: invoicesTable.dueDate,
        id: invoicesTable.id,
        invoiceStatus: invoicesTable.invoiceStatus,
        subtotal: sql<number>`COALESCE(SUM(${lineItemsTable.amount}), 0)`.as(
          "subtotal"
        ),
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
      dueDate: invoiceTotals.dueDate,
      id: invoiceTotals.id,
      invoiceStatus: invoiceTotals.invoiceStatus,
      subtotal: invoiceTotals.subtotal,
      total: invoiceTotals.total,
    })
    .from(invoiceTotals);
}

async function capture(
  d1: D1Database,
  label: string,
  rtts: number,
  built: { toSQL: () => { sql: string; params: unknown[] } },
  run: () => Promise<unknown>
): Promise<QueryCapture> {
  const { sql: querySql, params } = built.toSQL();
  const explain = await explainQueryPlan(d1, querySql, params);
  const timing = await timeFn(label, rtts, run);
  return { label, sql: querySql, params, explain, timing };
}

async function resolveFixture(db: AppDatabase): Promise<Fixture> {
  const [seedUser] = await db.query.user.findMany({ limit: 1 });
  if (!seedUser) {
    throw new Error("No users in local D1 — create auth users then db:seed");
  }
  const userId = seedUser.id;

  const pageClients = await db.query.clients.findMany({
    limit: TAKE,
    orderBy: { id: "desc" },
    where: { userId },
  });
  if (pageClients.length === 0) {
    throw new Error("No clients for seed user — run bun run db:seed");
  }

  return {
    userId,
    clientIds: pageClients.map((c) => c.id),
    focusClientId: pageClients[0]!.id,
    nowMs: Date.now(),
  };
}

async function timeRqbInvoiceList(
  db: AppDatabase,
  userId: string
): Promise<Timing> {
  return timeFn(
    "fetchPaginatedInvoices (RQB findMany + extras + with.client)",
    1,
    () =>
      db.query.invoices.findMany({
        columns: {
          clientId: true,
          createdAt: true,
          discount: true,
          dueDate: true,
          id: true,
          invoiceNumber: true,
          invoiceStatus: true,
          issueDate: true,
          subject: true,
          updatedAt: true,
          userId: true,
        },
        extras: {
          subtotal: (inv) => lineItemsSubtotalSqlForInvoiceId(inv.id),
        },
        limit: TAKE,
        orderBy: { id: "desc" },
        where: { userId },
        with: { client: { columns: { name: true } } },
      })
  );
}

/** #123 candidate (discarded in prod) — kept in harness for AFTER journal. */
async function timeRqbInvoiceListBatch(
  db: AppDatabase,
  userId: string
): Promise<Timing> {
  return timeFn(
    "DISCARD ref: RQB page + batch SUM IN ids (#123)",
    2,
    async () => {
      const rows = await db.query.invoices.findMany({
        columns: {
          clientId: true,
          createdAt: true,
          discount: true,
          dueDate: true,
          id: true,
          invoiceNumber: true,
          invoiceStatus: true,
          issueDate: true,
          subject: true,
          updatedAt: true,
          userId: true,
        },
        limit: TAKE,
        orderBy: { id: "desc" },
        where: { userId },
        with: { client: { columns: { name: true } } },
      });
      if (rows.length === 0) {
        return rows;
      }
      return lineItemSubtotalsForIdsQuery(
        db,
        rows.map((r) => r.id)
      );
    }
  );
}

async function timeClientsCombined(
  db: AppDatabase,
  userId: string
): Promise<Timing> {
  return timeFn(
    "fetchPaginatedClients combined (page + money CTE)",
    2,
    async () => {
      const rows = await clientsPageSelect(db, userId);
      const ids = rows.map((r) => r.id);
      if (ids.length === 0) {
        return [];
      }
      return clientReceivedBalanceQuery(db, userId, ids);
    }
  );
}

async function collectCaptures(
  d1: D1Database,
  db: AppDatabase,
  fixture: Fixture
): Promise<QueryCapture[]> {
  const { userId, clientIds, focusClientId } = fixture;
  const listPage = invoiceListPageSelect(db, userId);
  const listCorrelated = invoiceListCorrelatedSelect(db, userId);
  const pageRows = await listPage;
  const pageIds = pageRows.map((r) => r.id);
  const batchSums = lineItemSubtotalsForIdsQuery(db, pageIds);
  const listForClientPage = invoiceListForClientPageSelect(
    db,
    userId,
    focusClientId
  );
  const clientsSelect = clientsPageSelect(db, userId);
  const moneyQ = clientReceivedBalanceQuery(db, userId, clientIds);
  const clientTotalsQ = clientInvoiceTotalRowsQuery(db, userId, focusClientId);

  return [
    await capture(
      d1,
      "fetchPaginatedInvoices page only (no extras) #123",
      1,
      listPage,
      () => listPage
    ),
    await capture(
      d1,
      "fetchPaginatedInvoices batch SUM IN (page ids) #123",
      1,
      batchSums,
      () => batchSums
    ),
    await capture(
      d1,
      "BEFORE ref: select+correlated SUM (1 RTT)",
      1,
      listCorrelated,
      () => listCorrelated
    ),
    await capture(
      d1,
      "fetchPaginatedClients page (clients ORDER BY id LIMIT)",
      1,
      clientsSelect,
      () => clientsSelect
    ),
    await capture(
      d1,
      "fetchClientReceivedBalanceForIds (invoice_totals CTE)",
      1,
      moneyQ,
      () => moneyQ
    ),
    await capture(
      d1,
      "fetchClientInvoiceTotalRows CTE (#122 shared money scan)",
      1,
      clientTotalsQ,
      () => clientTotalsQ
    ),
    await capture(
      d1,
      "fetchPaginatedInvoicesForClient page only (#122)",
      1,
      listForClientPage,
      () => listForClientPage
    ),
  ];
}

function buildReport(args: {
  counts: SeedCounts;
  fixture: Fixture;
  captures: QueryCapture[];
  rqbTiming: Timing;
  rqbBatchDiscard: Timing;
  clientsCombined: Timing;
}): BaselineReport {
  const {
    counts,
    fixture,
    captures,
    rqbTiming,
    rqbBatchDiscard,
    clientsCombined,
  } = args;
  return {
    machine: {
      platform: process.platform,
      arch: process.arch,
      bun: Bun.version,
      cpus: navigator.hardwareConcurrency ?? null,
      date: new Date().toISOString(),
    },
    seedCounts: counts,
    fixture: {
      userIdPrefix: fixture.userId.slice(0, 8),
      focusClientIdPrefix: fixture.focusClientId.slice(0, 8),
      pageClientCount: fixture.clientIds.length,
      listLimit: PAGE,
      take: TAKE,
    },
    gap: {
      realFetchImport:
        "Blocked: #lib/server/db/index.ts imports cloudflare:workers. Timed createDb(D1) SQL equivalents + RQB findMany instead of fetchPaginated* wrappers (cursor decode skipped).",
      rqbExplain:
        "RQB findMany has no stable .toSQL(); EXPLAIN captured on select+join equivalent above.",
    },
    rqbFindManyTiming: rqbTiming,
    rqbBatchDiscardTiming: rqbBatchDiscard,
    clientsCombinedTiming: clientsCombined,
    captures,
  };
}

function printTimingLine(t: Timing): void {
  console.log(
    `- ${t.label}: median=${t.medianMs}ms mean=${t.meanMs}ms min=${t.minMs} max=${t.maxMs} samples=${JSON.stringify(t.samplesMs)} rtts=${t.rtts}`
  );
}

function printHumanReport(report: BaselineReport): void {
  console.log("# sql-list-baseline harness output");
  console.log(`date: ${report.machine.date}`);
  console.log(`seed: ${JSON.stringify(report.seedCounts)}`);
  console.log(
    `fixture: user=${report.fixture.userIdPrefix}… client=${report.fixture.focusClientIdPrefix}… take=${TAKE}`
  );
  console.log("");
  console.log("## Timings (warm discarded, median of samples)");
  for (const c of report.captures) {
    printTimingLine(c.timing);
  }
  printTimingLine(report.rqbFindManyTiming);
  printTimingLine(report.rqbBatchDiscardTiming);
  printTimingLine(report.clientsCombinedTiming);
  console.log("");
  for (const c of report.captures) {
    console.log(`## EXPLAIN: ${c.label}`);
    console.log("```sql");
    console.log(c.sql);
    console.log("```");
    console.log("params:", JSON.stringify(c.params));
    console.log("```");
    console.log(JSON.stringify(c.explain, null, 2));
    console.log("```");
    console.log("");
  }
  console.log("gap:", report.gap.realFetchImport);
}

async function runAgainstDb(d1: D1Database): Promise<BaselineReport> {
  const db = createDb(d1);
  const counts = await loadSeedCounts(d1);
  const fixture = await resolveFixture(db);
  const captures = await collectCaptures(d1, db, fixture);
  const rqbTiming = await timeRqbInvoiceList(db, fixture.userId);
  const rqbBatchDiscard = await timeRqbInvoiceListBatch(db, fixture.userId);
  const clientsCombined = await timeClientsCombined(db, fixture.userId);
  return buildReport({
    counts,
    fixture,
    captures,
    rqbTiming,
    rqbBatchDiscard,
    clientsCombined,
  });
}

async function runOracleMode(d1: D1Database): Promise<void> {
  if (writeOracle) {
    const golden = await buildOracleGolden(d1);
    writeOracleGolden(golden);
    console.log(
      `Wrote oracle golden → ${ORACLE_GOLDEN_PATH}\nhash=${golden.hash}\nseed=${JSON.stringify(golden.seedCounts)}`
    );
    return;
  }

  const result = await verifyOracleAgainstGolden(d1);
  if (!result.ok) {
    console.error(formatOracleVerifyFailure(result));
    process.exitCode = 1;
    return;
  }
  console.log(
    `Oracle OK hash=${result.hash} seed=${JSON.stringify(result.seedCounts)}`
  );
}

async function main(): Promise<void> {
  console.error("Opening local D1 (Miniflare persist under .wrangler)...");
  const proxy = await getPlatformProxy<{ DB: D1Database }>({
    persist: true,
    remoteBindings: false,
  });

  try {
    const d1 = proxy.env.DB;
    if (!d1) {
      throw new Error("D1 binding DB missing from wrangler platform proxy");
    }

    if (runOracle || writeOracle) {
      await runOracleMode(d1);
      return;
    }

    const report = await runAgainstDb(d1);
    if (asJson) {
      console.log(JSON.stringify(report, null, 2));
      return;
    }
    printHumanReport(report);
  } finally {
    await proxy.dispose();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
