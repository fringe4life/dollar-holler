# Research: esbuild `alwaysStrict` nested-scope gap → Wrangler SSR shadowing

**Date:** 2026-10-02  
**Status:** upstream filed — [evanw/esbuild#4545](https://github.com/evanw/esbuild/issues/4545)  
**Local tracking:** [#114](https://github.com/fringe4life/dollar-holler/issues/114)  
**Cam analysis (primary pointer):** [rolldown#11061 comment](https://github.com/rolldown/rolldown/issues/11061#issuecomment-5928222969)  
**Minimal try-repro:** [esbuild playground (0.28.1)](https://esbuild.github.io/try/#dAAwLjI4LjIAewoKICB0c2NvbmZpZ1JhdzogewogICAgY29tcGlsZXJPcHRpb25zOiB7CiAgICAgIHN0cmljdDogdHJ1ZSwKICAgIH0sCiAgfSwKfQBmdW5jdGlvbiBoZWFkKCkgewogIGNvbnNvbGUubG9nKCJoZWFkIik7Cn0KCmV4cG9ydCBmdW5jdGlvbiByZW5kZXIoKSB7CiAgaGVhZCgpOwoKICB7CiAgICBmdW5jdGlvbiBoZWFkKCkgewogICAgICBjb25zb2xlLmxvZygic25pcHBldCIpOwogICAgfQogICAgaGVhZCgpOwogIH0KfQoKcmVuZGVyKCk7)

---

## Verdict

1. **Filed:** [evanw/esbuild#4545](https://github.com/evanw/esbuild/issues/4545) (2026-10-02). Minimal try-repro + source cites + real-world Wrangler/SvelteKit notes.
2. **Do not upvote an older esbuild issue as the home for this fix.** Closest prior art is **[#2537](https://github.com/evanw/esbuild/issues/2537) (closed)** — same `alwaysStrict` → Annex B `var`s for nested functions, but shipped fix was **hash instability**, not nested-scope strict propagation. Cited from #4545; do not reopen.
3. **Do not file workers-sdk as the primary bug.** Wrangler correctly forwards `tsconfig` / `keepNames` into esbuild. Optional **workers-sdk docs / cookbook** note later is fine as **secondary**.
4. **Rolldown [#11061](https://github.com/rolldown/rolldown/issues/11061)** pointed at #4545; do not ask Oxc/Rolldown to “fix mangling” for this shape.

---

## Candidate issues

| Repo | # | Title | Status | Related? | URL |
| --- | --- | --- | --- | --- | --- |
| `evanw/esbuild` | [#4545](https://github.com/evanw/esbuild/issues/4545) | alwaysStrict / strict leaves nested scopes in sloppy mode… | **open** | **This bug.** Filed 2026-10-02 from this research. | https://github.com/evanw/esbuild/issues/4545 |
| `evanw/esbuild` | — | _(prior search: no earlier duplicate)_ | — | Superseded by #4545 | — |
| `evanw/esbuild` | [#2537](https://github.com/evanw/esbuild/issues/2537) | Unstable names when `alwaysStrict` is `true` | **closed** (fixed 0.15.8) | **Strong prior art.** Repro shows nested block `function` → `let` + unused `var` **only when `alwaysStrict`**; without it, no `var`. Fix was determinism of var names, **not** “nested scopes should be strict.” | https://github.com/evanw/esbuild/issues/2537 |
| `evanw/esbuild` | [#1552](https://github.com/evanw/esbuild/issues/1552) | Incorrect output when minifying with `--keep-names` | **closed** | Evan explains nested `function` rewrite depends on **strict vs sloppy** (`let` vs `var`). Background for why nested-scope `StrictMode` matters. Different failure (`keep-names` + inlining). | https://github.com/evanw/esbuild/issues/1552 |
| `evanw/esbuild` | [#2809](https://github.com/evanw/esbuild/issues/2809) | Nested function declaration → `Identifier already declared` under minify + ESM | **closed** | Annex B `var` pollution vs outer `const` under minify. Related transform; not `alwaysStrict` propagation. | https://github.com/evanw/esbuild/issues/2809 |
| `evanw/esbuild` | [#2264](https://github.com/evanw/esbuild/issues/2264) | `"use strict"` not emitted / request for `alwaysStrict` | **closed** | Origin of esbuild respecting `tsconfig` `alwaysStrict` / `strict`. Feature ask, not nested-scope bug. | https://github.com/evanw/esbuild/issues/2264 |
| `evanw/esbuild` | [#2347](https://github.com/evanw/esbuild/issues/2347) | `"use strict"` should not be emitted for ESM | **closed** | Emission of pragma under ESM; orthogonal to scope `StrictMode` flags. | https://github.com/evanw/esbuild/issues/2347 |
| `evanw/esbuild` | [#2381](https://github.com/evanw/esbuild/issues/2381) | Global `'use strict'` for CJS bundling | **closed** (won't fix) | Bundling / scope-flattening strictness tradeoffs. Not this early-exit. | https://github.com/evanw/esbuild/issues/2381 |
| `evanw/esbuild` | [#3789](https://github.com/evanw/esbuild/issues/3789) | `noImplicitUseStrict` ignored | **closed** (user error) | Confirms `alwaysStrict: false` turns off pragma; no nested-scope discussion. | https://github.com/evanw/esbuild/issues/3789 |
| `evanw/esbuild` | [#4505](https://github.com/evanw/esbuild/issues/4505) / [#4514](https://github.com/evanw/esbuild/pull/4514) | IIFE: put `"use strict"` inside wrapper | **open** | Placement of emitted pragma for concatenated scripts. Unrelated. | https://github.com/evanw/esbuild/issues/4505 |
| `evanw/esbuild` | [#4533](https://github.com/evanw/esbuild/issues/4533) / [#4534](https://github.com/evanw/esbuild/pull/4534) | Switch-case function → TDZ `let` | **open** | Same family of **block-function lowering**, different correctness bug (init timing). Mention as sibling; not a duplicate. | https://github.com/evanw/esbuild/issues/4533 |
| `cloudflare/workers-sdk` | [#6901](https://github.com/cloudflare/workers-sdk/issues/6901) / [#6902](https://github.com/cloudflare/workers-sdk/pull/6902) | minify mangled React names; enable `keepNames` | **closed** | `keep_names` product surface. Cam: this bug reproduces with keepNames on **or** off. | https://github.com/cloudflare/workers-sdk/issues/6901 |
| `cloudflare/workers-sdk` | [#7107](https://github.com/cloudflare/workers-sdk/issues/7107) / [#8771](https://github.com/cloudflare/workers-sdk/pull/8771) | `__name is not defined`; add `keep_names` opt-out | **closed** | keepNames / `__name` only. | https://github.com/cloudflare/workers-sdk/issues/7107 |
| `cloudflare/workers-sdk` | — | oxc / rolldown / alwaysStrict + Annex B SSR | — | **No matching issue** in search of workers-sdk for this failure mode | — |
| `rolldown/rolldown` | [#11061](https://github.com/rolldown/rolldown/issues/11061) | Oxc mangle breaks Svelte SSR… | **open** (`bug: upstream`) | Correctly reclassified to esbuild/`alwaysStrict`. Keep as pointer. | https://github.com/rolldown/rolldown/issues/11061 |

Search notes (2026-10-02): GitHub issue search on `evanw/esbuild` for `alwaysStrict` (~16 hits) and nested/block/Annex queries; `cloudflare/workers-sdk` for `keep_names`, `alwaysStrict`, oxc/rolldown; no open ticket matching nested-scope early-exit + shadowing.

---

## Primary confirmation: `alwaysStrict` early-exit (esbuild v0.28.1)

### 1. Module scope set non-recursively

[`js_parser.go` `prepareForVisitPass`](https://github.com/evanw/esbuild/blob/v0.28.1/internal/js_parser/js_parser.go#L18281-L18307):

```go
// Force-enable strict mode if that's the way TypeScript is configured
if tsAlwaysStrict := p.options.tsAlwaysStrict; tsAlwaysStrict != nil && tsAlwaysStrict.Value {
    p.currentScope.StrictMode = js_ast.ImplicitStrictModeTSAlwaysStrict
}

// ...

// ECMAScript modules are always interpreted as strict mode. This has to be
// done before "hoistSymbols" because strict mode can alter hoisting (!).
if p.isFileConsideredESM {
    p.moduleScope.RecursiveSetStrictMode(js_ast.ImplicitStrictModeESM)
}
```

Claim: `alwaysStrict` assigns **only** `currentScope` (module). It does **not** call `RecursiveSetStrictMode` for `ImplicitStrictModeTSAlwaysStrict`.

### 2. Recursive propagation early-exits if already non-sloppy

[`js_ast.go` `RecursiveSetStrictMode`](https://github.com/evanw/esbuild/blob/v0.28.1/internal/js_ast/js_ast.go#L1335-L1341):

```go
func (s *Scope) RecursiveSetStrictMode(kind StrictModeKind) {
	if s.StrictMode == SloppyMode {
		s.StrictMode = kind
		for _, child := range s.Children {
			child.RecursiveSetStrictMode(kind)
		}
	}
}
```

Claim: when module was already marked `ImplicitStrictModeTSAlwaysStrict`, the later ESM `RecursiveSetStrictMode` **returns without walking children**. Nested scopes remain `SloppyMode` → Annex B-style block-function → function-scoped `var` rewrite (as described in [#1552](https://github.com/evanw/esbuild/issues/1552) and demonstrated under `alwaysStrict` in [#2537](https://github.com/evanw/esbuild/issues/2537)).

Ironic consequence for ESM Workers: **`strict: true` in tsconfig can prevent nested scopes from becoming strict**, whereas a file without `alwaysStrict` would get full recursive ESM strict marking.

### 3. Docs: `strict` / `alwaysStrict` enable this path

[esbuild content-types → tsconfig.json](https://esbuild.github.io/content-types/#tsconfig-json):

> If either of these options [`alwaysStrict` / `strict`] are enabled, esbuild will consider all code in all TypeScript files to be in strict mode and will prefix generated code with `"use strict"` unless the output format is set to `esm`…

Resolver still attaches `TSAlwaysStrict` from the nearest enclosing tsconfig to resolve results ([`resolver.go` ~923–926](https://github.com/evanw/esbuild/blob/v0.28.1/internal/resolver/resolver.go); applied in [`bundler.go` ~1578–1579](https://github.com/evanw/esbuild/blob/v0.28.1/internal/bundler/bundler.go)), so Wrangler rebundling of project JS under a root `tsconfig.json` with `strict: true` hits this path. Explicit Wrangler `tsconfig` overrides that file.

---

## How Wrangler wires `tsconfig` → esbuild (primary)

| Surface | Behavior | Cite |
| --- | --- | --- |
| Config key `tsconfig` | Optional path to custom tsconfig; “Not applicable if you're using the Cloudflare Vite plugin.” | [Workers Wrangler configuration docs](https://developers.cloudflare.com/workers/wrangler/configuration/) |
| Config validation | Resolves relative to config file dir via `validateAndNormalizeTsconfig` | [`packages/workers-utils/src/config/validation.ts`](https://github.com/cloudflare/workers-sdk/blob/main/packages/workers-utils/src/config/validation.ts) (`validateAndNormalizeTsconfig`) |
| esbuild call | `...(tsconfig && { tsconfig })` on `esbuild.build` / context options | [`packages/wrangler/src/deployment-bundle/bundle.ts`](https://github.com/cloudflare/workers-sdk/blob/main/packages/wrangler/src/deployment-bundle/bundle.ts) |
| If unset | Wrangler omits the option; esbuild’s own nearest-tsconfig resolution applies | Same `bundle.ts` spread |
| `keep_names` | Docs: optional, **defaults to `true`**; maps to esbuild `keepNames` | [Wrangler configuration docs](https://developers.cloudflare.com/workers/wrangler/configuration/); [`BundlerController.ts`](https://github.com/cloudflare/workers-sdk/blob/main/packages/wrangler/src/api/startDevWorker/BundlerController.ts) (`keepNames: config.build.keepNames ?? true`) |
| Local workaround | App `wrangler.jsonc` → `"tsconfig": "tsconfig.wrangler.json"` with `strict: true` + `alwaysStrict: false` | This repo: `wrangler.jsonc`, `tsconfig.wrangler.json` |

Wrangler does **not** special-case `alwaysStrict`; it only chooses **which** tsconfig esbuild reads. Bug is therefore **esbuild**, not missing Wrangler API.

`keep_names` is a **red herring** for this incident (cam: try-repro fails with keepNames on or off).

---

## Recommended next action (human)

### Primary: ~~draft new `evanw/esbuild` issue~~ → **done**

Filed: [evanw/esbuild#4545](https://github.com/evanw/esbuild/issues/4545).

### After esbuild issue exists

1. ~~Comment on [rolldown#11061](https://github.com/rolldown/rolldown/issues/11061) with the esbuild URL~~ — done.
2. ~~Update local [#114](https://github.com/fringe4life/dollar-holler/issues/114) / `tsconfig.wrangler.json` `@see`~~ — done.
3. **Optional** workers-sdk: short docs note (“if you rebundle pre-mangled ESM and hit `is not a function` around block functions, try Wrangler `tsconfig` with `alwaysStrict: false`”) — **not** a substitute for the esbuild fix.
4. When #4545 closes with a fix in Wrangler’s esbuild range: drop `tsconfig.wrangler.json` override; re-verify prod `/login` `/signup` hard refresh.

### Do **not** comment-first on #2537 as the fix vehicle

Closed, different resolution. New issue that **links** #2537 is cleaner than asking to reopen.

---

## Do NOT file yet if…

1. A **new** `evanw/esbuild` issue appears that already cites `RecursiveSetStrictMode` + `alwaysStrict` nested sloppy (re-run search before posting).
2. You only have the Oxc-mangle narrative and **not** the try-repro / `alwaysStrict: false` confirmation — wait until cam’s playground (or equivalent) is in the body.
3. You are tempted to file **only** on workers-sdk asking Wrangler to “stop reading `strict`” — that papers over the esbuild bug and still bites every other esbuild user with `strict: true`.
4. You file against Rolldown/Oxc as a mangler correctness bug — mangling same short name in different scopes is valid; collision is introduced by esbuild’s sloppy rewrite.
5. You reopen #2537 expecting the old “unstable names” thread to carry a semantic fix — wrong closed reason.

---

## Local context (already landed)

- Workaround: `wrangler.jsonc` → `tsconfig.wrangler.json` (`strict: true`, `alwaysStrict: false`).
- Oxc mangling can stay on once Wrangler uses that tsconfig.
- Drop workaround only after esbuild ships recursive `alwaysStrict` (or equivalent) and SSR hard-refresh of `/login` `/signup` is re-verified.
