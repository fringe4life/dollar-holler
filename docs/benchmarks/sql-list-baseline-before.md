# SQL list baseline — BEFORE

**Date:** 2026-10-01 (UTC) / 2026-10-02 NZ  
**Harness:** `bun run bench:sql-list` (`scripts/sql-list-baseline.ts`)  
**Target:** local Miniflare D1 (`getPlatformProxy({ persist: true, remoteBindings: false })`)  
**Production query code:** not modified

## Seed size

Existing local seed kept (not re-seeded). Migrations already applied (`bun run db:migrate` → no pending).

| Table      | Rows |
| ---------- | ---- |
| user       | 3    |
| clients    | 6    |
| invoices   | 45   |
| line_items | 94   |
| settings   | 3    |

Fixture: one auth user (~15 invoices), page of clients for that user = **2** (seed: each user gets `users−1` clients). List `limit=10`, cursor `take=11`.

**Scale note:** seed-scale only. Wall times dominated by Miniflare/D1 RTT (~30ms floor), not SQLite scan cost. Useful for EXPLAIN shape + RTT count; not for extrapolating prod latency.

## Machine caveat

- Linux `fedora 7.2.8-200.fc44.x86_64`, x64, **4** CPUs, ~7.5 GiB RAM
- Bun **1.4.2**
- Local D1 via Wrangler/Miniflare persist under `.wrangler/state/v3/d1/`
- Absolute ms not comparable across machines; compare **median vs after** on same host + same seed counts

## Measurement gap

Real `fetchPaginated*` / `fetchClient*` import `#lib/server/db` → `cloudflare:workers` (unavailable under Bun scripts). Timed:

1. Drizzle `createDb(D1)` SQL matching production helpers (`lineItemsSubtotalSqlForInvoiceId`, invoice_totals CTE algebra)
2. RQB `db.query.invoices.findMany` with same `extras` + `with.client` as production list page

**Not included:** cursor decode / `fetchCursorPaginatedList` wrapper, auth, SvelteKit remote. Cursor path adds negligible SQL beyond the measured page query.

## Wall ms (warm=2 discarded; median of 7 samples)

| Metric | RTTs | median ms | mean | min | max | samples |
| --- | --- | --- | --- | --- | --- | --- |
| Invoice list select + correlated SUM | 1 | **34.33** | 34.87 | 31.32 | 38.83 | 31.32, 33.78, 37.22, 34.33, 32.44, 36.19, 38.83 |
| Invoice list RQB findMany + extras + client | 1 | **35.23** | 36.38 | 32.38 | 46.79 | 32.38, 46.79, 36.31, 32.91, 34.73, 35.23, 36.29 |
| Clients page (`ORDER BY id LIMIT`) | 1 | **41.36** | 41.12 | 31.49 | 50.90 | 31.49, 49.47, 33.64, 41.36, 50.90, 39.13, 41.83 |
| `fetchClientReceivedBalanceForIds` CTE | 1 | **39.47** | 38.73 | 30.79 | 43.32 | 30.79, 40.73, 38.28, 38.82, 43.32, 39.47, 39.69 |
| **Clients list combined (page + money)** | **2** | **66.62** | 67.16 | 64.26 | 69.98 | 68.60, 67.93, 66.54, 66.62, 66.16, 69.98, 64.26 |
| `fetchClientInvoiceSummary` CTE | 1 | **33.64** | 34.64 | 29.35 | 42.34 | 33.96, 33.64, 32.29, 39.27, 42.34, 31.65, 29.35 |
| Invoices-for-client select + correlated SUM | 1 | **32.85** | 33.57 | 31.37 | 38.08 | 34.03, 32.85, 32.75, 32.60, 38.08, 31.37, 33.33 |

### RTT notes

- Global invoice list / client invoice list / summary: **1** D1 round-trip each
- Clients list: **2** RTTs (page of clients, then money CTE for those ids) — matches production `fetchPaginatedClients`
- Combined clients median ≈ sum of page + money medians (RTT overhead stacks)

## EXPLAIN QUERY PLAN

Plans from D1 `EXPLAIN QUERY PLAN` on drizzle `.toSQL()` (same session as timings).

### 1. Invoice list (correlated SUM) — `fetchPaginatedInvoices` shape

```sql
select "clients"."name", "invoices"."discount", "invoices"."id",
  "invoices"."invoice_number", "invoices"."invoice_status", "invoices"."subject",
  COALESCE((SELECT SUM("line_items"."amount") FROM "line_items"
    WHERE "line_items"."invoice_id" = "invoices"."id"), 0)
from "invoices"
left join "clients" on "clients"."id" = "invoices"."client_id"
where "invoices"."user_id" = ?
order by "invoices"."id" desc
limit ?
```

| detail                                                                   |
| ------------------------------------------------------------------------ |
| SEARCH invoices USING INDEX `invoices_userId_id_idx` (user_id=?)         |
| SEARCH clients USING INDEX `sqlite_autoindex_clients_1` (id=?) LEFT-JOIN |
| CORRELATED SCALAR SUBQUERY 1                                             |
| SEARCH line_items USING INDEX `line_items_invoiceId_idx` (invoice_id=?)  |

### 2. Clients page — first RTT of `fetchPaginatedClients`

```sql
select … from "clients"
where "clients"."user_id" = ?
order by "clients"."id" desc
limit ?
```

| detail                                                         |
| -------------------------------------------------------------- |
| SEARCH clients USING INDEX `clients_userId_id_idx` (user_id=?) |

### 3. Client received/balance CTE — `fetchClientReceivedBalanceForIds`

```sql
with "invoice_totals" as (
  select "invoices"."client_id", "invoices"."id", "invoices"."invoice_status",
    ROUND(COALESCE(SUM("line_items"."amount"), 0)
      * (1 - COALESCE("invoices"."discount", 0) / 100)) as "total"
  from "invoices"
  left join "line_items" on "line_items"."invoice_id" = "invoices"."id"
  where "invoices"."client_id" in (?, ?)
  group by "invoices"."id"
)
select
  COALESCE(SUM(CASE WHEN "invoice_status" IS NULL OR "invoice_status" <> 'paid'
    THEN "invoice_totals"."total" ELSE 0 END), 0) as "balance",
  "client_id",
  COALESCE(SUM(CASE WHEN "invoice_status" = 'paid'
    THEN "invoice_totals"."total" ELSE 0 END), 0) as "received"
from "invoice_totals"
group by "invoice_totals"."client_id"
```

| detail |
| --- |
| CO-ROUTINE invoice_totals |
| **SCAN invoices USING INDEX `sqlite_autoindex_invoices_1`** (PK scan; `client_id IN (…)`) |
| SEARCH line_items USING INDEX `line_items_invoiceId_idx` (invoice_id=?) LEFT-JOIN |
| SCAN invoice_totals |
| USE TEMP B-TREE FOR GROUP BY |

**Plan smell:** no `client_id`-leading index → PK SCAN filtered by `IN`. Index `invoices_userId_clientId_id_idx` unused here (predicate is `client_id` only, no `user_id`).

### 4. Client invoice summary — `fetchClientInvoiceSummary`

```sql
with "invoice_totals" as (
  select "invoices"."due_date", "invoices"."id", "invoices"."invoice_status",
    ROUND(COALESCE(SUM("line_items"."amount"), 0)
      * (1 - COALESCE("invoices"."discount", 0) / 100)) as "total"
  from "invoices"
  left join "line_items" on "line_items"."invoice_id" = "invoices"."id"
  where (("invoices"."user_id" = ?) and ("invoices"."client_id" = ?))
  group by "invoices"."id"
)
select
  COALESCE(SUM(CASE WHEN "invoice_status" = 'draft' THEN … END), 0) as "draft",
  COALESCE(SUM(CASE WHEN "invoice_status" = 'sent' AND "due_date" >= ? THEN … END), 0) as "outstanding",
  COALESCE(SUM(CASE WHEN "invoice_status" = 'sent' AND "due_date" < ? THEN … END), 0) as "overdue",
  COALESCE(SUM(CASE WHEN "invoice_status" = 'paid' THEN … END), 0) as "paid"
from "invoice_totals"
```

| detail |
| --- |
| CO-ROUTINE invoice_totals |
| SEARCH invoices USING INDEX `invoices_userId_clientId_id_idx` (user_id=? AND client_id=?) |
| SEARCH line_items USING INDEX `line_items_invoiceId_idx` (invoice_id=?) LEFT-JOIN |
| SCAN invoice_totals |

### 5. Invoices for client — `fetchPaginatedInvoicesForClient` shape

```sql
select … COALESCE((SELECT SUM(…) …), 0)
from "invoices"
left join "clients" …
where (("invoices"."user_id" = ?) and ("invoices"."client_id" = ?))
order by "invoices"."id" desc
limit ?
```

| detail |
| --- |
| SEARCH invoices USING INDEX `invoices_userId_clientId_id_idx` (user_id=? AND client_id=?) |
| SEARCH clients USING INDEX `sqlite_autoindex_clients_1` (id=?) LEFT-JOIN |
| CORRELATED SCALAR SUBQUERY 1 |
| SEARCH line_items USING INDEX `line_items_invoiceId_idx` (invoice_id=?) |

## How to re-run

```bash
# ensure schema
bun run db:migrate

# optional: re-seed (wipes clients/invoices/line_items/settings; needs varlock + ≥3 auth users)
# bun run db:seed

# capture
bun run bench:sql-list
# or machine-readable:
bun run bench:sql-list -- --json 2>/dev/null | tail -n +1

# result-hash oracle (Group B keep/discard) — see sql-list-oracle.md
bun run bench:sql-list -- --oracle
```

Wrangler may print `Using secrets defined in .env.local` on stdout before JSON — strip or redirect stderr carefully; prefer human dump (no `--json`) when updating this doc by hand.

After lane changes, fill `docs/benchmarks/sql-list-baseline-after.md` with same columns on same seed counts.
