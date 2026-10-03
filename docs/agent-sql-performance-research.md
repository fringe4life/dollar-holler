# Research: AI agents / autoresearch loops for SQL performance & SQL-related rewrites

**Date:** 2026-10-02  
**Scope:** Primary-source stories of agents improving SQL **query performance**, **parsers/transpilers**, **index advice**, or **EXPLAIN-driven rewrite loops**. Seed: PostHog’s SQL parser rewrite. Goal: extract patterns that transfer (or do not) to dollar-holler’s SvelteKit + Drizzle + SQLite/Postgres invoice lists.  
**Out of scope as main stories:** pure text-to-SQL assistants (NL → SQL authoring) unless they share an oracle / agent-loop pattern useful here. Uber QueryGPT noted briefly as adjacent.

---

## Verdict

1. **Winning pattern is not “ask LLM to rewrite SQL.”** It is **agent + cheap measurable oracle + keep/discard loop** (Karpathy autoresearch shape), often with **EXPLAIN** as the diagnostic and **result-hash / differential parity** as the correctness gate.
2. **PostHog has two complementary stories:** (A) overnight **query-engine** autoresearch on prod slow queries → found a 3-year PK/timezone bug; (B) **parser rewrite** with old parser as oracle + PBT + prod corpus + shadow mode → ~70× (lab) / ~454× (prod) parse speedup.
3. **Datadog** applied the same autoresearch _meta_-loop to improve a **SQL optimization recommendation agent** (precision 0.54 → 0.86), not to rewrite one query — useful when the “system under test” is the advisor itself.
4. **Research systems (QUITE, LITHE, E3-Rewrite, SPA)** converge on: plan feedback → candidate rewrite → **equivalence check** → cost/runtime accept. Formal solvers help; at app scale, **hash of ordered result rows on fixture DB** is the transferable oracle.
5. **For dollar-holler:** take the **EXPLAIN loop + result-hash oracle + corpus of list queries + no prod writes**; skip ClickHouse sandboxes, full SQL-parser rewrites, and overnight swarm infrastructure until lists actually hurt under load.

---

## 1. Stories (short summary + link)

### PostHog — 70× SQL parser via agents + PBT oracle

- **Link:** https://posthog.com/blog/sql-parser (Robbie Coomber, 2026-06-24)
- **Also:** https://github.com/PostHog/posthog/tree/master/rust/hogql/parser · PRs e.g. [grammar PBT](https://github.com/PostHog/posthog/pull/58627), [two-sided rejection](https://github.com/PostHog/posthog/pull/59628), [coverage-guided PBT](https://github.com/PostHog/posthog/pull/60227)
- **Summary:** Parallel long-running Claude sessions rewrote HogQL’s ANTLR/C++ parser as a hand-rolled Rust recursive-descent (Pratt) parser (~16K LOC + tooling). **Correctness oracle = old C++ parser** (accept/reject + AST + positions). Disagreement generators: Hypothesis PBT from `.g4`, grammar jiggling, prod query corpus, ShrinkRay minimize, coverage-guided generation, “think hard about edge cases” agents. Loop: fail → shrink → fix against grammar/C++ → expand regression suite. **Shadow mode** in prod (new vs old parse); millions of parses, zero divergences → cut over with reverse shadow.
- **Patterns:** oracle, PBT, prod corpus, shadow mode, parallel agents sharing regression suite.

### PostHog — Karpathy autoresearch on query engine (PK / timezone)

- **Link:** https://posthog.com/blog/karpathy-autoresearch-query-engine-bug (Robbie Coomber, 2026-06-01)
- **Also:** https://github.com/PostHog/posthog/blob/HEAD/tools/query-performance-ai/README.md · coordinator PR https://github.com/PostHog/posthog/pull/57304 · campaign skill https://tessl.io/registry/skills/github/PostHog/posthog/clickhouse-autoresearch-campaign · Karpathy base https://github.com/karpathy/autoresearch
- **Summary:** Hackathon pointed `pi` + `pi-autoresearch` at ClickHouse slow queries on a throwaway cluster shaped like prod. Campaign structure: **lanes** (predicate order, timezone, PK usage, …) → **hypotheses** → **experiments** + reflection (not blind hill-climb). Agent ran **`EXPLAIN … indexes=1`**, saw `Partition: Condition='true'`, rewrote `toTimeZone(timestamp, tz) >= const` → bare `timestamp >= toDateTime64(…, tz)`. Semantics same; planner regained partition/PK pruning. Benchmark: −37% trimmed mean, **−62% granules** on a 7-day funnel. Follow-on product: Metabase `system.query_log` (only `ai_data_processing_approved`) → Docker sandbox per query → `/v1/run` with readonly caps → harvest `best.sql` → human-reviewed PRs.
- **Patterns:** autoresearch keep/discard, EXPLAIN loop, prod slow-query corpus, sandbox + readonly backend, campaign/lanes, human merge gate.

### Datadog — Autoresearch improves SQL _optimization agent_ accuracy

- **Link:** https://www.datadoghq.com/blog/llm-experimentation-autoresearch (2026-05-20)
- **Summary:** DBM already has a precise heuristic recommender (P≈0.90). Zero-shot LLM agent had high recall / low precision (P=0.54). Team adapted **Karpathy autoresearch** so the editable “weights” were **prompts, tools, skills**, scored by fixed evals on a **100-case dataset** (rewrites, indexes, anti-patterns, maintenance, schema; 30% negatives) with schema + EXPLAIN + metrics. **23 overnight experiments**, 17 kept; two-pass Haiku (detect then verify) reached **P=0.86, R=0.82**. Blind evals after phases to avoid overfitting.
- **Patterns:** autoresearch _on the advisor_, labeled corpus, precision/recall oracle, tool-evidence requirements, self-verify / two-pass, blind holdout.

### CrystalDBA Postgres MCP Pro — LLM index advisor + hypopg what-if

- **Link:** https://github.com/crystaldba/postgres-mcp (README: workload/query index tools)
- **Summary:** MCP tools for agents: `explain_query` (optional ANALYZE, **hypothetical indexes via hypopg**), `analyze_workload_indexes` / `analyze_query_indexes` with `method: dta | llm`. LLM path proposes indexes; hypopg predicts planner cost; results fed back for another LLM round. Workload sourced from `pg_stat_statements`.
- **Patterns:** EXPLAIN loop, what-if indexes, DB feedback to LLM, prod stats corpus.

### Good Timing / Baton — Agent taste-test + `tune_query` hash oracle

- **Link:** https://goodtiming.ai/blog/agent-taste-test-1/ (also https://dev.to/dreyler0/we-asked-an-agent-to-tune-1-slow-query-on-3-postgres-mcp-servers-it-had-notes-1fhb)
- **Summary:** Same slow Postgres query against three MCP servers. Stock agents re-ran the 34s query for baseline _and_ equivalence, and often built unneeded indexes. Fork added **`tune_query`**: one run returns plan + timing + rows + **full result hash** + verify recipe; flags default rewrite-yes / index-no; response embeds rule (“Verify with verify_sql; do not re-run the original”). Sessions dropped to ~124–179s vs up to ~513s.
- **Patterns:** result-hash oracle, single-shot baseline, tool-enforced policy (no index spam), avoid re-executing slow baseline.

### SQL-Surgeon — LangGraph EXPLAIN → advice → review → sandbox bench

- **Link:** https://github.com/RachelHuangZW/SQL-Surgeon
- **Summary:** LangGraph FSM: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` → LLM bottlenecks → index + rewrite script → LLM “senior DBA” review/retry (max 2) → optional isolated schema copy (≤100k rows), apply indexes, re-EXPLAIN, drop schema.
- **Patterns:** EXPLAIN loop, reviewer agent, sandboxed benchmark, bounded retry.

### QUITE — Multi-agent FSM query rewrite beyond rules

- **Link:** https://arxiv.org/html/2506.07675v3 (also arXiv abstract family)
- **Summary:** Training-free LLM agents in an FSM with tools + live DB feedback; middleware (knowledge base, SQL corrector for equivalence, memory); hint injection for better plans. Claims up to **~35.8%** latency reduction vs SOTA rule rewriters and more rewrite coverage. Decision agent reports cost/plan/resource dims, not EXPLAIN cost alone.
- **Patterns:** agent FSM, DB feedback, equivalence corrector, plan-aware accept criteria.

### LITHE — LLM rewrite advisor + multi-stage equivalence

- **Links:** https://arxiv.org/html/2502.12918 · EDBT PDF https://openproceedings.org/2026/conf/edbt/paper-93.pdf
- **Summary:** DBA-in-the-loop rewrite assistant. Equivalence: (1) sampled/correlated result checks, (2) logic tools **QED + SQLSolver**, (3) full-DB result compare if inconclusive. Discards “brittle” rewrites when optimizer cost disagrees with reality heuristics.
- **Patterns:** layered oracle (sample → formal → full), DBA gate, cost-vs-runtime caution.

### E3-Rewrite — Executability, equivalence, efficiency (RL)

- **Link:** https://arxiv.org/html/2508.09023
- **Summary:** Plan + demo context for bottleneck-aware prompts; reward = syntax/executability + equivalence (QED → LLM judge → sample exec) + efficiency; curriculum stages. Up to **~25.6%** time cut and more successful rewrites vs baselines.
- **Patterns:** plan-aware prompts, staged objectives (correct first, then fast), hybrid equivalence oracle.

### SPA — SQL-plan-aware RL rewriting

- **Link:** https://arxiv.org/abs/2606.08620
- **Summary:** Parse Postgres `EXPLAIN (FORMAT JSON)` into readable hints for the LLM; detect **plan divergence** (operator tree compare) before full timing; executability retries with EXPLAIN errors fed back; result comparison for equivalence; warm-up + multi-run timing.
- **Patterns:** EXPLAIN-as-prompt, plan-divergence filter, retry-on-error.

### LLMIA — LLM index advisor with in-context learning + feedback

- **Links:** https://arxiv.org/abs/2503.07884 · https://github.com/XinxinZhao798/LLMIndexAdvisor
- **Summary:** Iterative index actions from LLM + demonstrations; what-if / actual execution feedback; storage budget; stop after N steps, return best set.
- **Patterns:** index search as agent loop, DB feedback, workload file corpus.

### AutoSQL — Minimal Karpathy-style SQL rewrite loop

- **Link:** https://github.com/PrajwalAmte/AutoSQL
- **Summary:** Small open tool: baseline time + **result hash** → LLM rewrite → run → keep iff hash matches and faster → journal iterations. Explicitly targets correlated subqueries / multi-scan collapses (close to invoice-list pain).
- **Patterns:** autoresearch, result-hash oracle, budgeted iterations. (Young/small repo — treat as pattern demo, not production proof.)

### Databricks Genie Code — Agentic SQL dialect conversion (related)

- **Link:** https://www.databricks.com/blog/convert-proprietary-code-open-ansi-sql-genie-code (2026-07-30)
- **Summary:** Swarms of subagents convert T-SQL/Snowflake/… → ANSI SQL; iterate on errors; validate syntax + semantic intent; human skills for recurring fixes. Migration-focused, not OLTP list latency — still shows **parallel agents + validate-or-retry**.
- **Patterns:** parallel agents, syntax/semantic validation loop, human-encoded skills.

### Adjacent (not a performance-rewrite story)

- **Uber QueryGPT:** https://www.uber.com/blog/query-gpt/ — multi-agent NL→SQL (intent / tables / column prune / generate). Oracle is human ACK + usage metrics, not EXPLAIN speedup. Useful decomposition pattern only.

---

## 2. Pattern catalog

| Pattern | What it is | Strong examples |
| --- | --- | --- |
| **Oracle (differential)** | Candidate must match trusted system on accept/reject, AST, or outputs | PostHog parser vs ANTLR/C++; AutoSQL/Baton result hash |
| **PBT / fuzz** | Generate inputs that break the invariant (parity) | PostHog Hypothesis + `.g4` strategies + coverage guidance |
| **Shadow mode** | Run candidate beside production; log diffs; don’t serve yet | PostHog parser shadow → reverse shadow cutover |
| **EXPLAIN loop** | Agent reads plan, forms hypothesis, rewrites, re-explains | PostHog CH campaign; SQL-Surgeon; SPA; Postgres MCP |
| **Autoresearch keep/discard** | Fixed budget, one metric, journal, commit/revert candidates | Karpathy; PostHog query-performance-ai; Datadog agent meta-loop; AutoSQL |
| **Prod / realistic corpus** | Slow-query log, anonymized traces, labeled cases | PostHog query_log; Datadog 100-case set; pg_stat_statements |
| **Sandbox / readonly** | Isolated DB or `readonly` + caps; no customer blast radius | PostHog Docker + CH backend; SQL-Surgeon schema copy |
| **Campaign / lanes** | Structure search so agent doesn’t thrash one corner | PostHog lanes/hypotheses/reflection |
| **What-if indexes** | hypopg / planner cost without committing DDL | Postgres MCP; LLMIA |
| **Policy in the tool** | Defaults + response text constrain agent (rewrite vs index) | Baton `tune_query` |
| **Layered equivalence** | Sample → formal prover → full compare | LITHE; E3-Rewrite |
| **Advisor meta-eval** | Optimize the recommender against P/R, not one query’s ms | Datadog DBM |

---

## 3. Transfer to dollar-holler (SvelteKit + Drizzle + SQLite/Postgres)

**App reality (relevant hooks):** Invoice/client lists use Drizzle RQB `findMany` with **`extras` scalar subqueries** (`lineItemsSubtotalSqlForInvoiceId`) so `ORDER BY` + `LIMIT` stay one row per invoice — documented in `src/lib/features/invoices/queries/invoice-list-helpers.ts` and used by `invoices-list.server.ts`. Comments already say: materialize `invoices.total` only if **EXPLAIN** shows the correlated SUM hurting; avoid join explosion.

### Transfers well

| Idea | Why it fits |
| --- | --- |
| **EXPLAIN loop on list SQL** | Small query surface (invoice list, client list, summaries). SQLite `EXPLAIN QUERY PLAN` / Postgres `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)`. |
| **Result-hash / golden-row oracle** | Seed fixture DB; run baseline list SQL vs candidate; hash sorted rows (or compare JSON). Same idea as AutoSQL / Baton — critical before accepting CTE/JOIN rewrites of correlated SUMs. |
| **Autoresearch with tiny budget** | Metric = p50/p95 wall clock on fixture _at realistic N invoices × line items_; keep only if hash OK **and** faster. No need for overnight GPU. |
| **Corpus from app routes** | Capture SQL (or Drizzle-logged queries) for: global invoice list, client invoice list, search `q`, pagination cursors — not millions of HogQL shapes. |
| **Policy: rewrite first, indexes second** | Matches current comments and Baton lesson; avoid agent inventing indexes on D1/SQLite without measuring. |
| **Shadow / dual-run in tests** | Not prod shadow: in CI, run old helper SQL and candidate SQL on same fixture; fail on mismatch. Cheap “parser-style” oracle for query shape. |
| **Human merge gate** | Always: agent opens PR; humans own money/invoice correctness. |

### Does **not** transfer (or not yet)

| Idea | Why skip |
| --- | --- |
| **Full SQL parser rewrite + grammar PBT** | No custom SQL dialect/parser in-app; Drizzle emits SQL. |
| **ClickHouse partition/PK campaigns** | Wrong engine; no granule/partition story. |
| **Docker swarm + Metabase query_log orchestrator** | Overkill at current scale; privacy/ops cost. |
| **Formal SQLSolver/QED in the inner loop** | Heavy deps; hash-on-fixture covers list queries; reserve formal tools for rare ambiguous rewrites. |
| **Training RL rewrite models (E3/SPA)** | Research infra; use their _ideas_ (plan hints, curriculum: correct then fast), not training. |
| **Warehouse dialect converters (Genie)** | Not migrating SQL dialects. |
| **NL→SQL multi-agents (Uber)** | Lists are authored in TypeScript/Drizzle, not chat. |
| **Prod shadow of alternate query paths** | Only worth it when traffic + risk justify dual execution; CI dual-run is enough first. |

### Invoice-list-specific caution

- **Semantic traps:** `ROUND(subtotal * (1 - discount/100))` vs double SUM; stored `line_items.amount` vs recomputing `qty * unitPrice` (helpers warn about penny drift). Oracle must assert **business totals**, not only “same row count.”
- **Pagination:** Rewrites that join `line_items` before `LIMIT` can look faster on small fixtures and explode in prod — EXPLAIN + large synthetic fixtures required.
- **SQLite vs Postgres:** Plan vocabulary differs; run both if you ship dual backends (D1 + Postgres).

---

## 4. Practical playbook (agents on this repo)

Safe loop agents can run **without** touching production writes. Prefer fixture DB + tests; open PR for humans.

1. **Inventory hot paths**  
   List Drizzle call sites for invoice/client lists and summaries (`invoices-list.server.ts`, client list helpers, remote functions). Note filters: `userId`, `clientId`, search `q`, cursor pagination.

2. **Build a fixture corpus**  
   Script or seed: N users × M invoices × K line items (include discount edge cases, empty line items, long `LIKE` searches). Capture **baseline SQL** (Drizzle logger / `.toSQL()`) and **baseline result sets** for fixed parameter packs.

3. **Define the oracle**  
   For each case: canonical ordered result (ids + totals + pagination keys) → stable hash. Accept candidate only if hash matches. Optionally dual-compare against current helpers in CI (shadow-in-tests).  
   **Shipped (#119):** `scripts/sql-list-oracle.ts` + golden `scripts/fixtures/sql-list-oracle-golden.json`. See `docs/benchmarks/sql-list-oracle.md`. Group B (#122/#123): keep rewrite only if `bun run oracle:sql-list` still passes **and** bench/EXPLAIN improves.

4. **Measure baseline with EXPLAIN**  
   On SQLite: `EXPLAIN QUERY PLAN`. On Postgres: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)`. Record wall clock (warm + 3 runs). Flag: sequential scans on join keys, correlated SUM per row, join-before-limit.

5. **Agent lanes (structured search)**  
   Separate hypotheses so the agent doesn’t thrash:
   - (A) keep correlated `extras` but batch/subquery differently
   - (B) CTE / pre-aggregate `line_items` then join + `LIMIT`
   - (C) materialize `invoices.total` on write (schema + trigger/app write path)
   - (D) indexes only after A–C fail under load  
     Reflect after each experiment (PostHog lane discipline).

6. **Candidate loop**  
   Propose one change → regenerate SQL → hash check → EXPLAIN + timing → keep or discard → journal (`best.sql` / notes). Cap iterations. **Do not** re-run a known-slow baseline for every verify — cache baseline hash/timing (Baton lesson).

7. **Encode wins in Drizzle + tests**  
   Land helper changes next to `invoice-list-helpers.ts` with regression tests that freeze hashes for fixture packs. Re-run ultracite/typecheck. No silent SQL string drift without tests.

8. **Optional advisor pass**  
   If agent suggests indexes, require hypopg / `EXPLAIN QUERY PLAN` before/after on the **same** fixture; default deny DDL in agent tools. Ship index migrations as separate, reviewed PRs.

---

## 5. Source index (primary)

| Source | URL |
| --- | --- |
| PostHog SQL parser blog | https://posthog.com/blog/sql-parser |
| PostHog autoresearch query bug blog | https://posthog.com/blog/karpathy-autoresearch-query-engine-bug |
| PostHog query-performance-ai README | https://github.com/PostHog/posthog/blob/HEAD/tools/query-performance-ai/README.md |
| Karpathy autoresearch | https://github.com/karpathy/autoresearch |
| Datadog DBM autoresearch | https://www.datadoghq.com/blog/llm-experimentation-autoresearch |
| CrystalDBA Postgres MCP | https://github.com/crystaldba/postgres-mcp |
| Good Timing agent taste-test | https://goodtiming.ai/blog/agent-taste-test-1/ |
| SQL-Surgeon | https://github.com/RachelHuangZW/SQL-Surgeon |
| QUITE | https://arxiv.org/html/2506.07675v3 |
| LITHE | https://arxiv.org/html/2502.12918 |
| E3-Rewrite | https://arxiv.org/html/2508.09023 |
| SPA | https://arxiv.org/abs/2606.08620 |
| LLMIA | https://arxiv.org/abs/2503.07884 |
| AutoSQL | https://github.com/PrajwalAmte/AutoSQL |
| Databricks Genie converter | https://www.databricks.com/blog/convert-proprietary-code-open-ansi-sql-genie-code |
| Uber QueryGPT (adjacent) | https://www.uber.com/blog/query-gpt/ |

---

## 6. Bottom line for this codebase

Steal **PostHog’s discipline** (oracle + EXPLAIN + structured lanes + human PR) and **Baton/AutoSQL’s cheap equivalence** (result hash, one baseline). Skip **parser rewrites** and **CH overnight swarms**. Invoice lists already encode the hard lesson (no join explosion under `LIMIT`); agents should **measure and prove** any move to CTEs/materialized totals against a fixture oracle before merging.
