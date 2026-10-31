# CI / pre-CI

Proof gates only — **no deploy from GitHub Actions** yet. Ship stays local (`bun run deploy` → `varlock-wrangler`). Secrets strategy: [varlock-ci-secrets-research.md](./varlock-ci-secrets-research.md). Umbrella: [#234](https://github.com/fringe4life/dollar-holler/issues/234).

## Pre-commit (husky + lint-staged)

- ESLint / Prettier / Stylelint / `svelte-check` on staged sources
- `bun run audit:deps` (`bun audit --prod --audit-level=moderate`) when `package.json` or `bun.lock` is staged

## Workflows

| Workflow | When | What |
| --- | --- | --- |
| [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) | PR, push to `main`/`master`, weekly cron, `workflow_dispatch` | lint, typecheck, test (`VARLOCK_ENV=test`); **audit** always (including cron) |
| [`.github/workflows/bundlewatch.yml`](../.github/workflows/bundlewatch.yml) | PR, push to `main` | `bun run build` → Panda `createSerializeCss` fingerprint → BundleWatch |
| [`.github/workflows/fallow.yml`](../.github/workflows/fallow.yml) | PR, push | Fallow boundaries + advisory audit |

Shared setup: [`.github/actions/setup-app`](../.github/actions/setup-app/action.yml) (Bun, frozen install, Varlock test env).

## BundleWatch

- Config: [`bundlewatch.config.mjs`](../bundlewatch.config.mjs)
- Runner: `bun run ci:bundlewatch` ([`scripts/ci-bundlewatch.ts`](../scripts/ci-bundlewatch.ts)) expands globs with Bun (BundleWatch’s `glob@7` breaks on cwd paths with spaces)
- Uses workflow `GITHUB_TOKEN` as `BUNDLEWATCH_GITHUB_TOKEN` — no extra secret ([docs](https://bundlewatch.io/guide/using-bundlewatch))
- Fail on `maxSize` only; deltas vs `main` baseline appear on the `bundlewatch` commit status / results page
- First green **push to `main`** seeds the baseline
- Deeper “what module grew”: local `ANALYZE=true bun run build` → `stats.html`
- Panda hard-fail: `bun run ci:panda-fingerprint` rejects `createSerializeCss` in production output

## Env in CI

Always `VARLOCK_ENV=test` + committed [`.env.test`](../.env.test). Do not wire Bitwarden / Cloudflare / Sentry deploy secrets into these jobs.
