# SQL list baseline — AFTER

**Compare to:** [`sql-list-baseline-before.md`](./sql-list-baseline-before.md)  
**Harness:** `bun run bench:sql-list` (same machine + seed counts)  
**Oracle:** `bun run oracle:sql-list` — green  
`hash=3cdf593a07a7fc0fa0f51cbd09978f235ec283d322c90b498993cb2532f47d6b`

## Meta

| Field | Value |
| --- | --- |
| Date | 2026-10-03 (UTC) |
| Lane / change summary | Group A (#119–#121) + Group B: **#122 kept**, **#123 discarded**, **#125 skip** |
| Seed counts (user / clients / invoices / line_items) | 3 / 6 / 45 / 94 (+ settings 3) — match BEFORE |
| Machine | Linux `fedora 7.2.8-200.fc44.x86_64`, x64, **4** CPUs, ~7.5 GiB RAM, Bun **1.4.2** |

**Absolute ms note:** this host ran ~2× faster than the BEFORE capture day (correlated list ~15 ms vs ~34 ms). Prefer same-run Δ and EXPLAIN / RTT shape over cross-day wall ms.

## Keep / discard table

| Issue | Decision | Why |
| --- | --- | --- |
| #122 Client detail share money + drop verify | **KEEP** | Dropped 2× `verifyClient` RTTs on remotes. One request-memoized client CTE feeds list row totals + summary rolls. Oracle green. EXPLAIN: `invoices_userId_clientId_id_idx` (unchanged good plan). |
| #123 Invoice list batch CTE / `IN (page ids)` | **DISCARD** | Oracle green + EXPLAIN loses `CORRELATED SCALAR SUBQUERY`, but same-run median **worse**: RQB page+batch **21.26 ms / 2 RTT** vs correlated extras **~14–15 ms / 1 RTT**. Seed-scale RTT floor dominates. Prod stays on correlated `extras`. |
| #125 Extra indexes | **SKIP** | Money CTE AFTER plan is `SEARCH invoices_userId_id_idx` (thanks to #120 `userId`), not PK SCAN. Client detail CTE already uses `invoices_userId_clientId_id_idx`. No new migration. |
| #126 Materialize `invoices.total` | **deferred** | Question ticket — not implemented. |

## Wall ms (warm discarded; median of ≥5)

| Metric | RTTs | median ms (after) | median ms (before) | Δ / notes |
| --- | --- | --- | --- | --- |
| Invoice list select + correlated SUM | 1 | **14.69** | 34.33 | Host faster; shape unchanged (prod) |
| Invoice list RQB findMany + extras + client | 1 | _(re-run prod path; see harness)_ | 35.23 | Prod kept correlated |
| #123 DISCARD: RQB page + batch SUM | 2 | **21.26** | — | Worse than 1-RTT correlated same run |
| Clients page (`ORDER BY id LIMIT`) | 1 | **10.69** | 41.36 | Shape unchanged |
| `fetchClientReceivedBalanceForIds` CTE | 1 | **10.73** | 39.47 | Plan improved (#120 `userId`) |
| Clients list combined (page + money) | 2 | **29.07** | 66.62 | Still 2 RTT |
| #122 `fetchClientInvoiceTotalRows` CTE | 1 | **10.34** | — (was summary CASE CTE 33.64) | Shared scan; JS rolls summary |
| Invoices-for-client page only (#122) | 1 | **10.75** | 32.85 (page+correlated) | Totals from shared CTE (parallel / memo) |

### #122 RTT story (client detail)

**Before:** `verifyClient` + list(correlated) + `verifyClient` + summary(CTE) → up to **4** ownership/money RTTs when remotes waterfall.  
**After:** `getClient` still owns 404; list+summary remotes skip verify; **one** memoized money CTE shared in-request; list page query has no correlated SUM.

## EXPLAIN QUERY PLAN (after)

### 1. Invoice list (prod = correlated; #123 discard candidate)

**Prod / BEFORE ref** — still:

- `SEARCH invoices USING INDEX invoices_userId_id_idx`
- `CORRELATED SCALAR SUBQUERY` → `SEARCH line_items_invoiceId_idx`

**#123 batch SUM** (not shipped):

```text
SEARCH line_items USING INDEX line_items_invoiceId_idx (invoice_id=?)
```

No correlated subquery — plan win, latency loss at 2 RTT.

### 2. Clients page

Unchanged: `SEARCH clients USING INDEX clients_userId_id_idx`.

### 3. Client received/balance CTE

**BEFORE smell:** `SCAN invoices USING INDEX sqlite_autoindex_invoices_1` (PK) with `client_id IN (…)`.

**AFTER (#120 `userId`):**

```text
SEARCH invoices USING INDEX invoices_userId_id_idx (user_id=?)
SEARCH line_items USING INDEX line_items_invoiceId_idx (invoice_id=?) LEFT-JOIN
SCAN invoice_totals
```

PK SCAN gone → **#125 not needed** for this path.

### 4. Client invoice money (#122 shared CTE)

```text
SEARCH invoices USING INDEX invoices_userId_clientId_id_idx (user_id=? AND client_id=?)
SEARCH line_items USING INDEX line_items_invoiceId_idx (invoice_id=?) LEFT-JOIN
SCAN invoice_totals
```

Same index family as old summary CTE; rows include `subtotal` + SQL `ROUND` total; summary rolled in JS (`rollClientInvoiceSummary`).

### 5. Invoices for client (page only)

```text
SEARCH invoices USING INDEX invoices_userId_clientId_id_idx
SEARCH clients USING INDEX sqlite_autoindex_clients_1 LEFT-JOIN
```

No correlated SUM on the page query — money from #122 CTE.

## RTT / gap notes

Same measurement gap as BEFORE: real `fetch*` import `cloudflare:workers`; harness uses `createDb(D1)` + matching SQL / RQB.

Production after Group B:

- Global invoice list: correlated `extras` (1 RTT) — #123 discarded
- Client detail: shared memoized CTE + page without extras; no remote `verifyClient`
- Clients list money: still 2 RTT (page + CTE); plan better via #120

## How to re-run

```bash
bun run oracle:sql-list
bun run bench:sql-list
bun test scripts/sql-list-oracle.hash.test.ts scripts/sql-list-oracle.test.ts \
  src/lib/features/invoices/queries/client-invoice-summary-roll.test.ts
```
