# Research: a CI pipeline for this SvelteKit app

**Date:** 2026-10-15  
**Status:** research only — no workflow added  
**Question:** What do people actually run in CI for a SvelteKit app, beyond a single lint job? Use React Doctor as the comparison point for a React CI gate. Decide which of Fallow, ESLint, Prettier, Panda CSS, and the SvelteKit-native checks belong in CI for this repo.

Sources are official docs, first-party GitHub files, and paths in this repo. A blog was not used as evidence.

---

## Verdict

1. **The official Svelte app template does not emit a GitHub Actions workflow.** `sv create` / the all-addons snapshot ships `package.json` scripts: `check` (`svelte-kit sync && svelte-check --tsconfig ./tsconfig.json`), `lint` (`prettier --check . && eslint .`), `test` (Vitest `--run` plus Playwright), and `build` (`vite build`). The SvelteKit and Svelte CLI repos run their own CI (lint, typecheck, unit, Playwright). That matrix is for the framework, not a copy-paste app pipeline.
2. **This repo already has the ESLint + Prettier + Stylelint toolchain, not Ultracite/Biome.** `ultracite` and `biome` are not in `package.json`. `AGENTS.md` is a pasted Ultracite agents file that disagrees with itself. Do not add `bun x ultracite check`.
3. **One formatter.** Prettier (`bun run format:check`). Stylelint stays because it has CSS rules that are not formatting. Do not also run Biome or Ultracite.
4. **`bun run check` is not a sufficient CI typecheck.** It never runs Panda. `styled-system/` is gitignored, and app code imports `#styled-system`. Generate with the existing `bun run panda:build` (`svelte-kit sync && panda build`) before `svelte-check`. Do not use `panda check` while that folder is gitignored, and do not pass `--watch`.
5. **Unit tests are Bun, not Vitest.** `bun run test` → `bun test`. Playwright and Vitest are not installed. Do not add an e2e job until Playwright exists.
6. **The current Fallow workflow does not fail the build on boundary violations.** `.fallowrc.json` sets `boundary-violation` to `warn`. Fallow’s rule docs say `warn` reports and exits 0. The PR gate Fallow documents is `fallow audit` with `--gate new-only`, after a prepare step this repo already has.
7. **Do not deploy from pull requests.** Production deploy is `wrangler deploy` to the custom domain in `wrangler.jsonc`. Cloudflare’s GitHub Actions example deploys on push to `main` with API secrets. A PR job should compile with `bun run build` only after the Sentry upload behavior below is checked.

---

## What this repo runs today

### Scripts (`package.json`)

| Script | Command | Role |
| --- | --- | --- |
| `lint` | `eslint . --no-warn-ignored` | ESLint flat config |
| `format:check` | `prettier --check . --experimental-cli` | Prettier, including Svelte via `prettier-plugin-svelte` |
| `stylelint` | `stylelint "src/**/*.css"` | CSS |
| `check` | `lint` + `format:check` + `stylelint` + `svelte-kit sync` + `svelte-check --tsconfig ./tsconfig.json` | Local aggregate. No Panda, no tests |
| `check:watch` | `svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch` | Editor. Must not be the CI command |
| `tsc` / `tsc6` | `@typescript/native` `tsc --noEmit` / TypeScript 6 `tsc --noEmit` | Extra compilers. Not in the official template |
| `test` | `bun test` | Unit tests (`*.test.ts`). Preload in `bunfig.toml` |
| `panda:build` | `svelte-kit sync && panda build` | Generates gitignored `styled-system/` |
| `build` | `panda:build` then `vite build` | Production compile, Cloudflare adapter |
| `deploy` | `build` then `wrangler deploy` | Not wired to GitHub Actions |
| `fallow:boundary-violations` | `fallow:prepare` then `fallow dead-code --boundary-violations` | The only CI analysis |
| `fallow` / `fallow:dead-code` / `fallow:dupes` | prepare, then the matching CLI | Local / agent. Not in the workflow |
| `prepare` | `svelte-kit sync && husky` | Install hook. CI skips it |

Configs: `eslint.config.mjs` (flat config: `@eslint/js` recommended, `typescript-eslint` `recommended`, `eslint-plugin-svelte` `recommended` and `prettier`, `eslint-config-prettier`, `@pandacss/eslint-plugin` `recommended`), `prettier.config.mjs` (`prettier-plugin-svelte`), `stylelint.config.mjs` (standard + idiomatic order + `stylelint-prettier`), `panda.config.ts` (`outdir: "styled-system"`), `.fallowrc.json`, `vite.config.ts` (`@sveltejs/adapter-cloudflare`), `wrangler.jsonc`.

There is no `playwright.config.*`, no Vitest config, no `biome.json`, and no `ultracite` dependency. `AGENTS.md` tells agents to run `bun x ultracite fix` / `check` and then repeats that block once for Biome and twice for ESLint + Prettier + Stylelint. The installed tools are the second story. `README.md` “Lint/format” matches `package.json`.

### Workflows

Only `.github/workflows/fallow.yml`:

- Triggers: push to `main`/`master`, and every `pull_request`.
- `bun install --frozen-lockfile --ignore-scripts` (skips `prepare` / Husky).
- `VARLOCK_ENV=test` plus `dmno-dev/varlock-action@v1.0.1`, so `.env.test` dummy literals load and Bitwarden is not called (`bunfig.toml` preloads Varlock and sets `env = false`).
- One step: `bun run fallow:boundary-violations`.

`.github/dependabot.yml` updates Bun and GitHub Actions. That is supply-chain PRs, not a status check on app PRs.

`.husky` is gitignored. `lint-staged.config.ts` runs ESLint, Prettier, Stylelint, and a project-wide `svelte-check` on staged JS/TS/Svelte. That is the local gate. It does not run in GitHub Actions.

---

## What React Doctor is, and the Svelte-side map

React Doctor is a Million Software scanner for React, Next.js, Vite, TanStack, React Native, Expo, and Preact ([What is React Doctor?](https://www.react.doctor/docs/overview/what-is-react-doctor)). It is not a Svelte tool. Do not install it here.

Documented behavior:

- The CLI “deterministically scans React code for correctness, performance, security, accessibility, and maintainability issues.”
- It “complements your existing lint setup.” The CLI runs curated rules, React maintainability (complex React functions and repeated JSX by default), and dependency supply-chain checks. Whole-project unused files, exports, types, dependencies, and import cycles are opt-in.
- CI install is `npx react-doctor@latest ci install`, which writes `.github/workflows/react-doctor.yml` using `millionco/react-doctor@v2`. Default `blocking` is `none` (the check does not fail). Default PR `scope` is `changed` (findings introduced relative to the merge base). `blocking: error` fails on new errors; `blocking: warning` fails on any new finding ([GitHub Actions setup](https://www.react.doctor/docs/ci-and-prs/github-actions-setup), [Action reference](https://www.react.doctor/docs/reference/github-action-reference)).
- `security-scan` rules do not run inside the standalone ESLint/oxlint plugins. Those need the CLI ([ESLint and oxlint plugins](https://www.react.doctor/docs/configuration/eslint-and-oxlint-plugins)).
- The CLI reference includes `--no-lint` and `--no-supply-chain`. Supply-chain checks are Socket.dev (`--supply-chain`).

The pages above do not say React Doctor typechecks, runs unit tests, runs e2e, or builds the app. The documented product is a scanner plus a PR comment/status.

| React Doctor concern | Svelte-side tool that exists | In this repo |
| --- | --- | --- |
| Framework correctness (state, effects, JSX rules) | No React Doctor equivalent. Svelte compiler diagnostics and `eslint-plugin-svelte` | `svelte-check`; ESLint `svelte.configs.recommended` |
| Accessibility | Svelte compiler a11y hints via `svelte-check` / `sv check` | Same. Not a separate a11y job |
| Maintainability (complex functions, repeated JSX) | No JSX scanner. Fallow `health` is cyclomatic/cognitive/CRAP; `dupes` is cloned blocks | `.fallowrc.json` health caps and dupes settings. Not in CI except boundaries |
| Dead code, unused exports, cycles, boundaries | Fallow `dead-code` (React Doctor’s whole-project rules are opt-in; Fallow’s are the product) | Boundaries only, and those are `warn` |
| Dependency supply chain | Dependabot for version PRs. Not Socket | `.github/dependabot.yml`. No Socket job |
| Lint complement | ESLint | `bun run lint` |
| Tests and production build | Not React Doctor. SvelteKit `vite build`; this repo’s `bun test` | Scripts exist; no workflow |

---

## What official SvelteKit projects run

### App template the CLI emits

Fetched 2026-10-15 from [`packages/sv/src/cli/tests/snapshots/create-with-all-addons/package.json`](https://github.com/sveltejs/cli/blob/main/packages/sv/src/cli/tests/snapshots/create-with-all-addons/package.json) on `main`. That snapshot’s `.github/` contains `agents/` and `skills/` only ([contents API](https://api.github.com/repos/sveltejs/cli/contents/packages/sv/src/cli/tests/snapshots/create-with-all-addons/.github)). No `workflows/` directory.

| Job a human would add | Command the template actually defines | Source |
| --- | --- | --- |
| Typecheck | `svelte-kit sync && svelte-check --tsconfig ./tsconfig.json` | snapshot `check` |
| Lint + format | `prettier --check . && eslint .` | snapshot `lint` |
| Format write (local) | `prettier --write .` | snapshot `format` |
| Unit | `vitest`, and the aggregate passes `--run` so CI does not watch | snapshot `test:unit` / `test` |
| E2E | `playwright install && playwright test` | snapshot `test:e2e` |
| E2E server | `webServer.command`: `npm run build && npm run preview`, port `4173` | [snapshot `playwright.config.ts`](https://github.com/sveltejs/cli/blob/main/packages/sv/src/cli/tests/snapshots/create-with-all-addons/playwright.config.ts) |
| Build | `vite build` | snapshot `build` |

The same snapshot’s Vitest config is browser-mode Playwright for `*.svelte.{test,spec}` plus a Node project for other tests ([`vite.config.ts`](https://github.com/sveltejs/cli/blob/main/packages/sv/src/cli/tests/snapshots/create-with-all-addons/vite.config.ts)). That is what you get from `sv add vitest` / `sv add playwright`, not what this repo has.

Svelte’s own testing page matches the e2e server: Playwright `webServer` `npm run build && npm run preview`, port 4173, tests under `tests/` ([Testing](https://svelte.dev/docs/svelte/testing)). `sv check` is the documented CLI for unused CSS, accessibility hints, and JS/TS compiler errors, and it says machine output is for CI ([sv check](https://svelte.dev/docs/cli/sv-check)). TypeScript docs say `svelte-check` is the command-line check to put in CI ([TypeScript](https://svelte.dev/docs/svelte/typescript)). `svelte-kit sync` generates `tsconfig.json` and route `$types` and is the `prepare` script ([CLI](https://svelte.dev/docs/kit/cli)). `vite build` is the production build; the adapter runs as the second stage ([Building your app](https://svelte.dev/docs/kit/building-your-app)).

`vite-plugin-checker` does not appear in the SvelteKit docs retrieved for this note (building, CLI, testing, TypeScript, integrations, `sv check`). The documented CI typecheck is `svelte-check` / `sv check`.

### Framework repos (do not copy the matrix)

[sveltejs/kit `.github/workflows/ci.yml`](https://github.com/sveltejs/kit/blob/main/.github/workflows/ci.yml) on `main` (fetched 2026-10-15):

| Job | Command | What it is |
| --- | --- | --- |
| `lint-all` | `pnpm run lint`, then a `git status` check that generated kit types were committed, then `pnpm run check` | Monorepo lint/typecheck |
| `test` | `pnpm test:kit:unit` / `test:others` across Node 22, 24, and Windows | Vitest unit tests |
| `e2e` | `pnpm test:kit:dev:*`, `test:kit:build:*`, async and server-resolution variants, plus Firefox/WebKit/Windows/macOS shards | Playwright against the kit test apps in dev and production |

Root [`package.json` scripts](https://github.com/sveltejs/kit/blob/main/package.json): `lint` is `oxfmt --check .` plus `eslint` on `packages/**/*.{js,d.ts}`. `check` runs each package’s `check` after `prepublishOnly`. That is not `svelte-check` of an app, and the formatter is oxfmt, not Prettier.

[sveltejs/cli `.github/workflows/ci.yml`](https://github.com/sveltejs/cli/blob/main/.github/workflows/ci.yml): `pnpm lint`, `pnpm build` plus a generated API-surface diff, `pnpm check`, `pnpm test:ci` on Ubuntu/Windows/macOS. Playwright (`pnpm exec playwright install chromium` and `pnpm test:addons`) runs only when a PR is labeled `needs-addon-integration-tests`.

Both workflows set `concurrency` with `cancel-in-progress: true` and `permissions: contents: read`.

---

## `svelte-check` flags that matter

From the [svelte-check README](https://github.com/sveltejs/language-tools/blob/master/packages/svelte-check/README.md) on `master`, and the same flags on [sv check](https://svelte.dev/docs/cli/sv-check). This repo pins `svelte-check@4.7.6`. The flag table below is the upstream README, not `svelte-check --help` from that install.

| Flag | Documented behavior | For this repo |
| --- | --- | --- |
| `--tsconfig ./tsconfig.json` | Only files matched by that config are diagnosed, and JS/TS errors are reported | Already in `check` and in the official template. `tsconfig.json` extends `$app/tsconfig` and includes `src`, `theme`, `scripts`, Vite/Panda/Drizzle configs |
| `--watch` | Stays alive and reruns | `check:watch` only |
| `--fail-on-warnings` | “Will also exit with error code when there are warnings” | Off today. Turning it on fails the job on a11y and unused-CSS warnings, not only type errors. Do not add it until the current warning count is known |
| `--threshold error` | Display filter: `error` prints only errors; `warning` (default) prints both | Display, not documented as the exit-code switch. The exit-code switch for warnings is `--fail-on-warnings` |
| `--output machine` / `machine-verbose` | Row-oriented / ndjson output “easier to read by machines, e.g. inside CI” | Optional. Human output is fine for a required check |
| `--compiler-warnings` | Per-code `ignore` or `error` | Not set. Use only to promote a specific a11y code, not as a blanket |
| `--diagnostic-sources` | `js` (includes TS), `svelte`, `css`. Default is all | Leave default so unused CSS and a11y stay |
| `--tsgo` | Use the TypeScript Go implementation. README says install TypeScript 6 and TypeScript 7; the flag table also says `@typescript/native-preview` | This repo’s `tsc` script calls `@typescript/native` directly. `svelte-check` in `check` does not pass `--tsgo`. Do not add a second required typecheck until those two commands are shown to catch different bugs |

The README FAQ: there is no “changed files only” mode, because a renamed prop breaks call sites that were not in the diff. CI must see the whole project. `svelte-kit sync` has to run first so `$app/tsconfig` and `./$types` exist ([CLI](https://svelte.dev/docs/kit/cli)). `panda:build` already runs `svelte-kit sync`.

---

## Fallow in CI

Pin in this repo: `fallow@3.33.1` (`package.json`). Commands below are from [CI integration](https://docs.fallow.tools/integrations/ci), [fallow audit](https://docs.fallow.tools/cli/audit), [dead-code](https://docs.fallow.tools/cli/dead-code), [boundaries](https://docs.fallow.tools/analysis/boundaries), and [rules](https://docs.fallow.tools/configuration/rules).

| Command | What it catches | CI posture in the docs | This repo |
| --- | --- | --- | --- |
| `fallow dead-code` | Unused files, exports, types, dependencies, cycles, unresolved imports, boundary violations | Combined default of the GitHub Action. `fail-on-issues` defaults to true | Script `fallow:dead-code`. Not in the workflow. Full-repo unused-code will be noisy on an existing app |
| `fallow dead-code --boundary-violations` | Only boundary violations | Same exit rules as dead-code | **This is the workflow.** `.fallowrc.json` sets `boundary-violation` to `warn` |
| `fallow dupes` | Cloned blocks. Default mode `mild` | Inside audit, duplication is a warning unless a threshold is set | `duplicates.minOccurrences` 3, `minLines` 18, one ignored file. Script only |
| `fallow health` | Complexity, maintainability, hotspots | Complexity over the configured thresholds is an error inside `audit` | Caps: cyclomatic 15, cognitive 15, CRAP 75. Script does not exist; the CLI does |
| `fallow audit` | Dead code + complexity + duplication + styling, scoped to changed files, verdict `pass` / `warn` / `fail` | The documented PR gate. `--gate new-only` is the default: inherited findings do not fail. `pass` exits 0, `warn` exits 0, `fail` exits 1, runtime errors exit 2 | No script. Needs `fallow:prepare` first |
| `fallow security` | Unverified local candidates | Separate gate. Gated failures exit 8. PR comment renderers skip security envelopes | Not a required check |
| `fallow fix` | Writes fixes | `dry-run` defaults to true on the Action | Not CI |
| (empty command / `fallow --ci`) | All analyses | Action default. Heavier than `audit`, and `fail-on-issues: true` | Too broad for a required PR job |

Exit codes from the rules page: `error` fails (exit 1), `warn` reports and exits 0, `off` is silent. `--fail-on-issues` treats warnings as failures without editing config. The workflow does not pass that flag, so today’s boundary job is a report that still goes green while the rule stays `warn`. Boundaries docs say to start at `warn` and move to `error` once the repo is clean.

Official Action: `fallow-rs/fallow@v3`. If `version` is omitted, the Action uses the `fallow` spec in `package.json` (here `3.33.1`); the `@v3` ref is the Action wrapper, not the CLI pin. It does not document a Panda codegen step. This repo must run `bun run fallow:prepare` first: `styled-system/` is gitignored and Fallow resolves those imports (`README.md`, `.agents/skills/fallow/SKILL.md`). The Action also installs via its own package-manager detection. The existing workflow already has the Varlock-safe install. Prefer `bun run fallow:prepare && fallow audit` in that job over replacing it with the Action until someone checks the Action on this Bun + Varlock checkout.

`typeAware` in `.fallowrc.json` is `enabled: true`, `require: best-effort`. Fallow’s CI page says type-aware analysis does not emit compiler diagnostics. It is not a substitute for `svelte-check`.

Editor-only pieces (MCP, LSP, `fallow agent`, Cursor hooks) are already covered in `docs/fallow-cursor-mcp.md`. They are not CI.

**Recommendation:** keep the boundary workflow. Treat it as advisory until `boundary-violation` is `error` or the step passes `--fail-on-issues`. Add `fallow audit` (after prepare) as a second advisory job with the default `new-only` gate. Promote it to required after one PR shows the verdict is `pass` or `warn`, not a wall of inherited `fail`. Do not require full-repo `fallow`, `dupes`, or `health` on every PR.

---

## ESLint, Prettier, Stylelint, Ultracite

One formatter: Prettier.

| Tool | Installed? | What CI should run | Why not a second job |
| --- | --- | --- | --- |
| Prettier 3.9 + `prettier-plugin-svelte` 4.1 | Yes | Existing `bun run format:check` | [Prettier CI](https://prettier.io/docs/install) and [CLI](https://prettier.io/docs/cli): `prettier --check` exits 1 when files differ. The official template’s `lint` script is `prettier --check . && eslint .`. This repo’s script also passes `--experimental-cli`. That flag was not in the Prettier CI page read for this note; keep the existing script rather than inventing a shorter one |
| ESLint 10 + `typescript-eslint` 8 + `eslint-plugin-svelte` 3 | Yes | Existing `bun run lint` | Getting started says run `eslint .` ([typescript-eslint](https://typescript-eslint.io/getting-started/)). Flat config is required by eslint-plugin-svelte v3 ([migration](https://sveltejs.github.io/eslint-plugin-svelte/migration/)). This repo already extends `svelte.configs.recommended` and `svelte.configs.prettier`. No separate plugin CI command is documented |
| Stylelint 17 | Yes | Existing `bun run stylelint` | [Stylelint CLI](https://stylelint.io/user-guide/cli) exits 2 on a lint problem. Rules here include unknown at-rules, property values, and order, plus `prettier/prettier`. The Prettier rule overlaps `format:check` on `src/**/*.css` only. The other rules do not |
| Ultracite | Not a dependency | Do not run | [Usage](https://www.ultracite.ai/docs/usage): `npx ultracite check` lints without writing and, for the ESLint toolchain, wraps ESLint, Prettier, and Stylelint. [Introduction](https://www.ultracite.ai/docs): three toolchains (Oxlint, Biome, or ESLint+Prettier+Stylelint). Adding it beside the three scripts double-runs them. `AGENTS.md` is not a CI config |

ESLint’s `--max-warnings` defaults to `-1`, so warnings do not fail the process. Setting `0` makes any warning exit 1 ([ESLint CLI](https://eslint.org/docs/latest/use/command-line-interface)). typescript-eslint does not document `--max-warnings 0` as the CI command. The parser docs do say `parserOptions.onUnsupportedTypeScriptVersion: 'error'` is useful in CI so an unsupported TypeScript does not only warn ([parser](https://typescript-eslint.io/packages/parser)). This repo is on TypeScript 6.0.2 and ESLint 10, which is inside the range on [dependency versions](https://typescript-eslint.io/users/dependency-versions) (`eslint` `^8.57.0 || ^9 || ^10`). Do not add `--max-warnings 0` until someone counts current warnings.

typescript-eslint “strongly recommend[s]” type-aware linting (`recommendedTypeChecked` + `projectService`) and notes the cost is usually paid in CI ([typed linting](https://typescript-eslint.io/getting-started/typed-linting)). This repo’s config uses `tseslint.configs.recommended`, not `recommendedTypeChecked`. `svelte-check --tsconfig` already reports TypeScript errors. Turning on typed ESLint is a config change with its own runtime, not a flag on the current `lint` script. Leave it out of the first pipeline.

`eslint-config-prettier` is last in the ESLint extends list, which is what Prettier’s install page asks for so ESLint does not fight the formatter.

---

## Panda CSS in CI

From the [CLI reference](https://panda-css.com/docs/reference/cli) (page “Last updated on October 8, 2026”):

| Command | Writes? | CI use |
| --- | --- | --- |
| `panda dev` | Yes, and watches | Local only. It is `panda build --watch` |
| `panda build` / bare `panda` | Yes, once: styled-system and CSS | This repo’s `panda:build`. No `--watch` |
| `panda codegen` | styled-system only. Skips the source scan and CSS extraction | Enough for TypeScript helpers and types. Not what `panda:build` runs |
| `panda cssgen` | CSS only. Skips codegen | Needs an existing styled-system |
| `panda check` | No. Exits non-zero if output is missing or stale | “use it in CI to catch a `styled-system` that drifted from your config or source” |
| `--watch` / `-w` | Rebuilds on change | Documented on `dev`, `build`, `codegen`, `cssgen`, `lib`. Off in CI |

[Styled system](https://panda-css.com/docs/reference/styled-system): the folder is a build artifact, usually gitignored, regenerated with `panda codegen` or `panda build`. The install guide’s `prepare: panda codegen` is how a gitignored `outdir` comes back after install ([CLI install](https://panda-css.com/docs/installation/cli)). This repo’s `prepare` is `svelte-kit sync && husky`, and CI passes `--ignore-scripts`, so nothing generates `styled-system/` unless a step runs `panda:build`.

`.gitignore` ignores `styled-system`. `package.json` `"imports"` maps `#styled-system` to `./styled-system`. `panda check` on a fresh checkout therefore fails because the output is missing, which is the documented missing-output failure, not a useful drift check. Drift checking applies if the folder is committed. Here it is not.

`svelte-check` needs that folder on disk before it can resolve `#styled-system` imports. `bun run check` does not build it. A typecheck job has to run `bun run panda:build` first (sync + `panda build`, no `--watch`). The production `bun run build` already includes `panda:build`, so the build job does not need a second codegen.

`@pandacss/eslint-plugin` is already inside `bun run lint` (`panda.configs.recommended` with `configPath: ./panda.config.ts`). That is the Panda lint. It is not `panda check`. Whether the plugin reads `styled-system/` was not verified; the config only passes `configPath`.

`panda analyze` reports unused tokens and recipes. It is a cleanup report, not a merge gate. `panda doctor` validates setup and exits non-zero on config errors. Optional, not part of the first required set.

The Vite plugin in `vite.config.ts` is `@pandacss/vite` with `transform: true`. That runs during `vite build` / `vite dev`. It does not replace `panda build` for the gitignored TypeScript output.

---

## Cloudflare

This app deploys with Wrangler, not Alchemy. `deploy` is `bun run build && wrangler deploy`. `wrangler.jsonc` sets `main` to `.svelte-kit/cloudflare/_worker.js`, `assets.directory` to `.svelte-kit/cloudflare`, `nodejs_compat`, a D1 binding, and the custom domain `dolla-holla.org`. There is no Alchemy config.

SvelteKit’s adapter page says deploy with `npx wrangler deploy` or Cloudflare’s Git integration ([Cloudflare](https://svelte.dev/docs/kit/adapter-cloudflare)). Cloudflare’s own GitHub Actions page shows `cloudflare/wrangler-action@v4` running on push to `main`, with `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` ([GitHub Actions](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)). Builds docs separate a build command (`npm run build`) from a deploy command that defaults to `npx wrangler deploy`. `npx wrangler versions upload` creates a version without promoting it; it is still a remote write ([Builds](https://developers.cloudflare.com/workers/ci-cd/builds/)). No `wrangler deploy --dry-run` showed up on those pages.

**PR job:** `bun run build` only, after the Sentry note below. **Not** `wrangler deploy`, **not** `versions upload`, **not** a preview on every PR. A main-branch deploy workflow is a separate decision and needs real Cloudflare secrets. This repo does not have one.

`wrangler.jsonc` `build.command` is `bun run cf:restore-workers`, which runs when Wrangler bundles. `vite build` alone does not execute that Wrangler step. A green `bun run build` shows the SvelteKit adapter emit. It does not show Wrangler accepting the worker. That gap stays until a deploy or `versions upload` job exists.

### Sentry on `bun run build`

`vite.config.ts` passes `authToken: process.env.SENTRY_AUTH_TOKEN` into `sentrySvelteKit`, with org `coinnich` and project `javascript-sveltekit`. `.env.test` sets `SENTRY_AUTH_TOKEN=ci-dummy-sentry-token`, and the Fallow workflow loads that file via `VARLOCK_ENV=test`. Sentry’s docs say a production build uploads source maps when an auth token is set, and that the way to skip upload is `autoUploadSourceMaps: false` ([source maps](https://docs.sentry.io/platforms/javascript/guides/sveltekit/sourcemaps/), [build options](https://docs.sentry.io/platforms/javascript/guides/sveltekit/configuration/build/)). Whether a dummy token fails the Vite build was not executed for this note. Confirm that before making `build` a required check. A required build that calls Sentry with the dummy token is the most likely surprise.

---

## Recommended pipeline for this repo

Same checkout and env as `.github/workflows/fallow.yml`: `actions/checkout@v7`, `oven-sh/setup-bun@v2`, `bun install --frozen-lockfile --ignore-scripts`, `VARLOCK_ENV=test`, then `dmno-dev/varlock-action@v1.0.1`. Any `bun` command loads Varlock (`bunfig.toml`).

GitHub: give the workflow `permissions: contents: read` and a concurrency group with `cancel-in-progress: true`, which is what kit and the CLI do ([workflow syntax](https://docs.github.com/actions/reference/workflow-syntax-for-github-actions)). Do not `paths`-filter a workflow you then mark required. A skipped workflow stays Pending and blocks the merge ([troubleshooting required status checks](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks)).

Fast jobs can share one install (one job, several steps) or be separate jobs. Separate jobs repeat install. The commands are the decision; the YAML split is secondary.

### Required on pull requests (fast)

| Check name | Command | Notes |
| --- | --- | --- |
| `lint` | `bun run lint` | Errors fail. Warnings do not, unless you later add `--max-warnings 0` |
| `format` | `bun run format:check` | The only formatter |
| `stylelint` | `bun run stylelint` | CSS rules. Overlaps Prettier on `src/**/*.css` via `stylelint-prettier` |
| `typecheck` | `bun run panda:build && svelte-check --tsconfig ./tsconfig.json` | Not `bun run check` (no Panda). Not `--watch`. Not `--fail-on-warnings` yet |
| `test` | `bun run test` | `bun test` exits non-zero on failure and emits GitHub annotations with no extra config ([Bun test](https://bun.com/docs/cli/test)). Do not pass `--watch` |

### Required on pull requests (slower), after the Sentry check

| Check name | Command | Notes |
| --- | --- | --- |
| `build` | `bun run build` | `panda build` plus `vite build` and the Cloudflare adapter. Does not deploy |

### Already present — keep, but it is not a real gate yet

| Check name | Command | Notes |
| --- | --- | --- |
| `boundaries` | `bun run fallow:boundary-violations` | Stays green while `boundary-violation` is `warn`. Required only after the rule is `error` or the step adds `--fail-on-issues` |

### Advisory (not required)

| Check name | Command | Notes |
| --- | --- | --- |
| `fallow-audit` | `bun run fallow:prepare && fallow audit` | Default `--gate new-only`. `warn` exits 0. Promote to required after a clean PR. Official Action is optional and still needs prepare |

### Not in this pipeline

- `bun x ultracite check` / Biome format.
- A second Prettier job.
- `panda check`, `panda dev`, `panda build --watch`, `svelte-check --watch`.
- `bun run tsc` / `bun run tsc6` as required checks.
- Vitest or Playwright until those tools are added. If Playwright is added later, the template command is `playwright install && playwright test` with `webServer` `build && preview` on port 4173. There is no Playwright.dev SvelteKit guide; [component testing](https://playwright.dev/docs/test-components) is a gallery you own and names Svelte as one possible framework. Vitest’s first-party Svelte path is browser mode plus `vitest-browser-svelte` ([browser mode](https://vitest.dev/guide/browser/)). This repo’s unit tests are Bun.
- `wrangler deploy` or `wrangler versions upload` on pull requests.
- React Doctor.
- Knip. Not checked against knip.dev in this pass. Fallow already covers unused files and dependencies.

---

## Gaps

- Did not run `svelte-check --help` for the installed 4.7.6. Flags are from language-tools `master` README. The `--tsgo` package name in that README disagrees with itself (`@typescript/native` in the prose, `@typescript/native-preview` in the table).
- Did not run a CI `bun run build` with `VARLOCK_ENV=test`, so the dummy `SENTRY_AUTH_TOKEN` behavior is unverified.
- Did not run `fallow dead-code --boundary-violations` to count current warnings. The “exits 0” claim is the rules doc plus the local `"warn"` setting.
- Did not verify `@pandacss/eslint-plugin` needs `styled-system/` on disk.
- Did not look up Prettier’s `--experimental-cli`.
- Did not read a Knip SvelteKit plugin page.
- `playwright.dev` has no SvelteKit-specific guide in the search used here. The Svelte docs and the CLI snapshot are the e2e sources.
- Kit’s per-package `check` script was not opened. The root `check` script fans out to packages; it is not this app’s `svelte-check`.

---

## Sources

### This repo

- `package.json`, `eslint.config.mjs`, `prettier.config.mjs`, `stylelint.config.mjs`, `panda.config.ts`, `.fallowrc.json`, `vite.config.ts`, `wrangler.jsonc`, `tsconfig.json`, `bunfig.toml`, `lint-staged.config.ts`, `.gitignore`, `.env.test`, `.github/workflows/fallow.yml`, `.github/dependabot.yml`, `AGENTS.md`, `README.md`, `.agents/skills/fallow/SKILL.md`, `docs/fallow-cursor-mcp.md`

### Svelte

- [sv check](https://svelte.dev/docs/cli/sv-check)
- [Testing](https://svelte.dev/docs/svelte/testing)
- [TypeScript](https://svelte.dev/docs/svelte/typescript)
- [Building your app](https://svelte.dev/docs/kit/building-your-app)
- [CLI / svelte-kit sync](https://svelte.dev/docs/kit/cli)
- [Cloudflare adapter](https://svelte.dev/docs/kit/adapter-cloudflare)
- [sveltejs/kit ci.yml](https://github.com/sveltejs/kit/blob/main/.github/workflows/ci.yml)
- [sveltejs/kit package.json](https://github.com/sveltejs/kit/blob/main/package.json)
- [sveltejs/cli ci.yml](https://github.com/sveltejs/cli/blob/main/.github/workflows/ci.yml)
- [create-with-all-addons package.json](https://github.com/sveltejs/cli/blob/main/packages/sv/src/cli/tests/snapshots/create-with-all-addons/package.json)
- [create-with-all-addons playwright.config.ts](https://github.com/sveltejs/cli/blob/main/packages/sv/src/cli/tests/snapshots/create-with-all-addons/playwright.config.ts)
- [create-with-all-addons vite.config.ts](https://github.com/sveltejs/cli/blob/main/packages/sv/src/cli/tests/snapshots/create-with-all-addons/vite.config.ts)
- [svelte-check README](https://github.com/sveltejs/language-tools/blob/master/packages/svelte-check/README.md)

### React Doctor

- [What is React Doctor?](https://www.react.doctor/docs/overview/what-is-react-doctor)
- [GitHub Actions setup](https://www.react.doctor/docs/ci-and-prs/github-actions-setup)
- [Action reference](https://www.react.doctor/docs/reference/github-action-reference)
- [ESLint and oxlint plugins](https://www.react.doctor/docs/configuration/eslint-and-oxlint-plugins)
- [CLI reference](https://www.react.doctor/docs/reference/cli-reference)
- [millionco/react-doctor](https://github.com/millionco/react-doctor/)

### Fallow

- [CI integration](https://docs.fallow.tools/integrations/ci)
- [fallow audit](https://docs.fallow.tools/cli/audit)
- [fallow dead-code](https://docs.fallow.tools/cli/dead-code)
- [Boundaries](https://docs.fallow.tools/analysis/boundaries)
- [Rules and exit codes](https://docs.fallow.tools/configuration/rules)

### Lint and format

- [ESLint CLI](https://eslint.org/docs/latest/use/command-line-interface) (`--max-warnings`, exit codes)
- [typescript-eslint getting started](https://typescript-eslint.io/getting-started/)
- [typescript-eslint typed linting](https://typescript-eslint.io/getting-started/typed-linting)
- [typescript-eslint parser](https://typescript-eslint.io/packages/parser)
- [eslint-plugin-svelte user guide](https://sveltejs.github.io/eslint-plugin-svelte/user-guide/)
- [eslint-plugin-svelte v3 migration](https://sveltejs.github.io/eslint-plugin-svelte/migration/)
- [Prettier install / CI](https://prettier.io/docs/install)
- [Prettier CLI `--check`](https://prettier.io/docs/cli)
- [Stylelint CLI](https://stylelint.io/user-guide/cli)
- [Ultracite usage](https://www.ultracite.ai/docs/usage)
- [Ultracite introduction](https://www.ultracite.ai/docs)

### Panda, tests, Cloudflare, GitHub

- [Panda CLI reference](https://panda-css.com/docs/reference/cli)
- [Panda styled system](https://panda-css.com/docs/reference/styled-system)
- [Panda CLI install / prepare codegen](https://panda-css.com/docs/installation/cli)
- [Bun test runner](https://bun.com/docs/cli/test)
- [Vitest browser mode](https://vitest.dev/guide/browser/) (Svelte example and `vitest-browser-svelte`)
- [Playwright component testing](https://playwright.dev/docs/test-components)
- [Sentry SvelteKit source maps](https://docs.sentry.io/platforms/javascript/guides/sveltekit/sourcemaps/)
- [Sentry SvelteKit build options](https://docs.sentry.io/platforms/javascript/guides/sveltekit/configuration/build/)
- [Cloudflare Workers GitHub Actions](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)
- [Cloudflare Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/)
- [GitHub Actions workflow syntax](https://docs.github.com/actions/reference/workflow-syntax-for-github-actions) (concurrency, path filters)
- [Troubleshooting required status checks](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks)
