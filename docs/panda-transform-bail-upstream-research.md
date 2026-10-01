# Research: Panda `transform: true` silent bail → upstream ask

**Date:** 2026-10-01  
**Status:** research only — no upstream issue filed yet beyond existing [#3853](https://github.com/chakra-ui/panda/issues/3853)  
**Local epic:** [#109](https://github.com/fringe4life/dollar-holler/issues/109)

---

## Verdict

1. **No in-flight “strict / fail-closed build” work found.** Vite plugin options today are only `cwd` / `configPath` / `outdir` / `transform?: boolean`. Diagnostics pipeline exists (`TransformResult.diagnostics` → Vite `this.warn`) but generic fold **bails are silent**.
2. **[#3853](https://github.com/chakra-ui/panda/issues/3853) already open** (our `has:` case): fold **or** diagnostic. **0 maintainer comments.** Prefer **comment / extend that thread** before opening a sibling “strict mode” issue — unless they want the product ask separated from the `has:` fold bug.
3. **Do not ask** “fail build whenever any `css`/`cva` remains.” Docs + blog call residual runtime **“by design, not a failure.”** That ask will get closed/rejected.
4. **Do ask** (aligned with their vocabulary): diagnostic when planner **bails a fully static object** for an **unsupported / non-condition nested key** (documented “Must bail”), plus optional severity `off | warn | error`. Precedent: [#3697](https://github.com/chakra-ui/panda/pull/3697) + `imported_recipe_raw_dynamic` (“warns rather than fails silently”).

---

## What maintainers already said (primary sources)

### Product policy — intentional residual runtime

| Source | Quote / stance |
| --- | --- |
| [Source Transforms docs](https://panda-css.com/docs/styling/source-transforms) | “A call Panda cannot resolve to a literal keeps its runtime form. **This is by design, not a failure.**” |
| [Zero runtime blog](https://panda-css.com/blog/zero-runtime-all-the-way-down) | “**This is a decision, not a failure**”; “Reserve runtime `css()` for values that are truly unknown”; “**One unsafe site never bails a whole file.**” |

### Design notes — bail taxonomy

From [`design-notes/transformer/README.md`](https://github.com/chakra-ui/panda/blob/v2/design-notes/transformer/README.md) (v2):

- Result shape: `changed`, **`bailed`**, `diagnostics`.
- **Finite dynamic** (enumerable ternaries) → may rewrite; **open-ended dynamic** → must bail / preserve call.
- Explicit **Must bail** for `css(...)`: open-ended values, unresolved spreads, dynamic keys, branch budget, **and**:
  > “a property nested under a key that is not a condition (`{ foo: { color } }`) — the runtime names that class differently from the encoder”
  - This is exactly the `#3853` / `has: { svg: … }` class: **static object, unsupported nest → bail**, not “author meant dynamic.”
- “**fail closed**” in notes = don’t invent empty CSS for unresolved branches — **not** “fail the Vite build if fold misses.”
- `.raw` cross-file gap: “**warns rather than fails silently**” via `imported_recipe_raw_dynamic`. **Warning is deliberate.**

### Precedent: silent wrongness treated as bug

[#3697](https://github.com/chakra-ui/panda/pull/3697) (merged): `.raw()` desugared to class strings → wrong composition.

> “**No error, no warning.** … Consumers had **no way to notice.**”

Fix + warn path for remaining dynamic imported `.raw`. Same pain story as silent full-runtime ship on `#3853`.

### Diagnostics already wired (narrow codes)

| Mechanism | Behavior |
| --- | --- |
| Vite `warnDiagnostics` | Caps to 3 + “and N more”; uses `formatDiagnostic` |
| `imported_recipe_raw_dynamic` | Warn on unfoldable imported `.raw(dynamic)` |
| `transform_hashed_recipe_skipped` | Warn when hashed names block recipe fold |
| `panda_call_unextractable` | Extraction-time (not transform fold) |
| `recipe_variant_dynamic` | Spec’d in [`design-notes/recipe-variant-diagnostics.md`](https://github.com/chakra-ui/panda/blob/v2/design-notes/recipe-variant-diagnostics.md) — warn on dynamic recipe variants; **may not be fully shipped** in diagnostic codes list |

**Missing:** diagnostic when transform bails because of **unsupported static nest** / other “Must bail” static shapes while extract still emits CSS.

### Related transform history (not duplicate of this ask)

| Ref | Role |
| --- | --- |
| [#3847](https://github.com/chakra-ui/panda/issues/3847) / [#3848](https://github.com/chakra-ui/panda/pull/3848) / [#3850](https://github.com/chakra-ui/panda/pull/3850) | SFC host gate — fixed; orthogonal |
| [#3830](https://github.com/chakra-ui/panda/pull/3830) | `cva`/`sva` → `__pcx` / `__pr` specialization |
| [#3692](https://github.com/chakra-ui/panda/pull/3692)–[#3700](https://github.com/chakra-ui/panda/pull/3700) | Correctness / folds / design-note refresh |
| [#3853](https://github.com/chakra-ui/panda/issues/3853) | `has:` silent no-op — **start here** |

No separate public RFC; design notes + blogs = design record.

---

## Desired product ask (draft — for upstream)

### Problem (one sentence)

With `transform: true`, some **fully static** style objects hit a planner **Must bail** and leave the **full** `styled-system/css` runtime in the bundle with **`changed: false` and no diagnostic**, so apps believe zero-runtime shipped when it did not.

### Non-goals (say out loud — earns trust)

- Do **not** fail or warn on **open-ended dynamic** sites (`css({ color: tone })`, `center({ minBlockSize: map[size] })`) — those **keep runtime by design**.
- Do **not** require every residual `__pcx` + thin `css(...)` to be an error — partial fold is success.
- Folding `has:` itself can stay a separate fix on #3853; this ask is **observability / severity**.

### Desired behavior

1. **Compiler diagnostic** when transform bails a call for an **unsupported / invalid static shape** (e.g. non-condition nested key), including:
   - file path
   - **source span** (line/col — same as existing `formatDiagnostic`; not a JS stack dump)
   - reason / code (suggest name: `transform_unsupported_static_bail` or `transform_non_condition_nest`)
   - hint when known (`_icon` / `'& svg'` for icon-ish cases)
2. **Severity control** (fallow-like ladder), default TBD with maintainers:
   - Plugin: e.g. `transformBail: 'off' | 'warn' | 'error'` **scoped to unsupported-static bails** (not all bails)
   - and/or env for CI: `PANDA_TRANSFORM_BAIL=warn|error|off`
   - `error` → Vite/plugin fail the transform / build (elevate existing warn path)
   - `warn` → current Vite `this.warn` pipeline
   - `off` → today’s silence (dev convenience / migration)
3. Optionally later: verbose mode for **all** bails (including open-ended dynamic) — separate flag so production CI isn’t noisy.

### Contrast table (put in issue)

| Case | Example | Today | Desired |
| --- | --- | --- | --- |
| Open-ended dynamic | `css({ color: props.color })` | Keep runtime, silent | Keep silent (or opt-in verbose) |
| Unsupported static nest | `css({ has: { svg: {…} } })` | Keep **full** runtime, silent | Diagnostic + configurable severity |
| Intentional partial | static + dynamic merge → `__pcx` | Success | Unchanged |
| Semantic hazard | imported `.raw(dynamic)` | `imported_recipe_raw_dynamic` | Precedent to cite |

### Filing etiquette (outside own repos)

1. **Comment on #3853 first** — ask: “Want fold-only here, or also ship diagnostic + `off|warn|error` on this thread / sibling?”
2. Short repro (already on #3853). Link design-note “Must bail” non-condition nest + #3697 “no way to notice.”
3. Use **their words**: bail, fold, residual runtime, finite vs open-ended dynamic, warn rather than fail silently.
4. Offer to open a focused follow-up issue if they prefer split bugfix vs feature.
5. Don’t lecture about “zero runtime docs lie” — frame as **gap between Must-bail static shapes and diagnostic coverage**.

---

## Suggested comment on #3853 (paste-ready)

```markdown
## Follow-up ask: observability for this class of bail

The `has:` case maps to the transformer design note **Must bail** rule for a property nested under a key that is not a condition — so refusing the fold is consistent with planner policy. The painful part for apps is the **silent** outcome: `changed: false`, no `diagnostics` entry, and the full `styled-system/css` runtime still ships while extract/runtime still emit classes.

That matches the “consumers had no way to notice” failure mode fixed for `.raw` in #3697 (`imported_recipe_raw_dynamic` — “warns rather than fails silently”).

### Proposal (orthogonal to folding `has:` itself)

1. Emit a transform diagnostic (file + span + reason) when the planner bails a **fully static** object for an unsupported/non-condition nest (and similar unsupported-static Must-bail shapes).
2. Optional host severity: `transformBail: 'off' | 'warn' | 'error'` (and/or `PANDA_TRANSFORM_BAIL`) **scoped to that category** — not to intentional open-ended dynamic sites, which docs correctly call “by design, not a failure.”

Happy to split this into a sibling issue if you’d rather keep #3853 focused on folding `has:` / aligning encoder vs transform.

Happy to adjust naming to match existing codes (`imported_recipe_raw_dynamic`, `transform_*`).
```

---

## Local next steps (after upstream reply / filing)

- Optional dollar-holler tracking issue via `track-upstream-workaround` once upstream URL exists.
- Keep grepping client for `createSerializeCss` as interim CI smoke until diagnostics land.
- Do **not** expand axis-map campaign (#111) as substitute for this ask.
