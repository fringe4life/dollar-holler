# SQL list result-hash oracle

**Issue:** [#119](https://github.com/fringe4life/dollar-holler/issues/119)  
**Module:** `scripts/sql-list-oracle.ts`  
**Golden:** `scripts/fixtures/sql-list-oracle-golden.json`  
**Harness:** `bun run bench:sql-list`

## What it freezes

On local Miniflare D1 seed (same fixture as BEFORE baseline):

| Pack slice | Fields (ordered) |
| --- | --- |
| Invoice list page | `id`, `invoiceNumber`, `invoiceStatus`, `discount`, `subtotal`, `total` (`ORDER BY id DESC`, take=11) |
| Clients money | page client ids → `balance`, `received` (page order) |
| Client summary | `draft`, `outstanding`, `overdue`, `paid`, `grandTotal` for newest page client |
| Invoices-for-client | same row shape as list, scoped to focus client |

`hash` = SHA-256 of key-sorted JSON of `results` only. `fixture.nowMs` is frozen so outstanding/overdue CASE buckets do not drift wall-clock.

The hashed SQL lives in `scripts/sql-list-oracle.ts` (mirrored shapes). Production `fetch*` helpers import `db` from `cloudflare:workers`, so this script does not call them. A production-only edit can stay green until the mirror is updated.

## Commands

```bash
# after migrate + seed (or when seed intentionally changes)
bun run oracle:sql-list:write
# equivalent: bun run bench:sql-list -- --write-oracle

# fail process if rewrite changed totals
bun run oracle:sql-list

# unit (hash stability) + integration (D1 vs golden)
bun test scripts/sql-list-oracle.hash.test.ts scripts/sql-list-oracle.test.ts
```

Reseed or different local D1 → fixture ids/counts drift → oracle fails. Re-capture with `--write-oracle` only after intentional seed change (not to “fix” a bad rewrite).

## Group B (#122 / #123) — how to use

1. Run `--oracle` (or the bun tests) **before** editing query shapes; confirm green on current helpers.
2. Apply one rewrite lane (share money scan on client detail, or batch CTE for invoice list extras).
3. Keep candidate **only if**:
   - `bun run bench:sql-list -- --oracle` still passes (hash match), **and**
   - `bun run bench:sql-list` median improves **or** EXPLAIN clearly better (document in `sql-list-baseline-after.md`).
4. Do **not** `--write-oracle` to paper over a totals mismatch — that means the rewrite changed money.
5. Production `fetch*` still imports `cloudflare:workers`; oracle uses the same SQL algebra via `createDb(D1)` (same gap as the timing harness).

Related: `docs/agent-sql-performance-research.md` §4 (oracle + keep/discard), `docs/benchmarks/sql-list-baseline-before.md`.
