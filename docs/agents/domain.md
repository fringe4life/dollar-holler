# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root, or
- **`CONTEXT-MAP.md`** at the repo root if it exists: it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- **`docs/adr/`**: read ADRs that touch the area you're about to work in.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context repo:

```
/
├── CONTEXT.md          (optional; create when domain terms settle)
├── docs/adr/
└── src/
```

## SQL list performance (current effort)

Primary sources already in-repo:

- `docs/agent-sql-performance-research.md`
- `docs/benchmarks/sql-list-baseline-before.md`
- `docs/benchmarks/sql-list-oracle.md` — result-hash oracle (#119); Group B gate
- `scripts/sql-list-baseline.ts` (`bun run bench:sql-list`; `--oracle` / `--write-oracle`)
- `scripts/sql-list-oracle.ts` + `scripts/fixtures/sql-list-oracle-golden.json`
- Query contracts in `src/lib/features/invoices/queries/invoice-list-helpers.ts` and `src/lib/features/clients/queries/client-list-helpers.ts`

### Invoice detail / editor RTT (#121)

`fetchInvoiceDetail` loads invoice + client + lineItems via RQB `with` (1 SQL / 1 D1 RTT).

| Path | Before | After |
| --- | --- | --- |
| Detail page | 3 (invoice → parallel client + lineItems) | 1 |
| Editor open | 3 (`getInvoice` + `verifyInvoice` + lineItems) | 1 (`getInvoiceDetail`) |
