# Research: Varlock secrets in CI/CD (PR test env → restricted deploy)

**Date:** 2026-11-01  
**Status:** research only — no workflow or schema changes in this note  
**Question:** How should this project avoid exposing secrets when using Varlock in CI/CD—especially as it moves from test-env PR checks toward production builds/deploys?

Sources are official Varlock docs and packages (`varlock.dev`, `dmno-dev/varlock-action`, installed `@varlock/vite-integration@1.5.4`), GitHub Docs (Actions secrets / environments / `pull_request_target`), Cloudflare Workers secrets and GitHub Actions CI docs, Bitwarden Secrets Manager machine-account docs, and paths in this repo. Related issues: [#148](https://github.com/fringe4life/dollar-holler/issues/148), [#234](https://github.com/fringe4life/dollar-holler/issues/234), [#233](https://github.com/fringe4life/dollar-holler/issues/233). Extends [docs/sveltekit-ci-pipeline-research.md](./sveltekit-ci-pipeline-research.md); does not reverse its “do not deploy from PRs” / test-env CI stance.

---

## Executive summary

**Avoid exposure by never giving PR CI real secrets, and never deploying a worker built under `VARLOCK_ENV=test`.** Redaction and “only run Bitwarden when needed” help, but they are not enough on their own: with this repo’s current Vite setting `ssrInjectMode: "resolved-env"`, a successful build **bakes resolved env into the SSR/worker artifact**. A test-env build therefore contains dummy secrets; a production-env build would contain real ones. Either artifact is a leak surface if uploaded, logged, or deployed by mistake.

**“Limit when it runs” (no Bitwarden / no Actions secrets on `pull_request`) is necessary and mostly sufficient for today’s PR jobs** (lint, typecheck, test, fallow, and the planned #148 compile-only build). It is **not** sufficient for a ship path: that needs a **separate, restricted deploy (or shippable-build) job** with environment protection, real secret-zero (`BITWARDEN_ACCESS_TOKEN` and/or Cloudflare credentials), no fork PR access, and **no reuse of PR build artifacts**.

**Recommended split for this repo**

| Lane | Trigger | Env | Secrets | Artifact fate |
| --- | --- | --- | --- | --- |
| **PR / proof CI** | `pull_request` + push to default branch | `VARLOCK_ENV=test` + committed `.env.test` dummies + `dmno-dev/varlock-action` | No repo/environment secrets for Bitwarden, Cloudflare deploy, or Sentry upload | Compile-only (#148). **Never** `wrangler deploy` / `versions upload`. Discard or don’t publish the worker |
| **Ship** (later, under #234) | `push` to `main` and/or `workflow_dispatch`, job `environment: production` with required reviewers + deployment branch rules | `VARLOCK_ENV=production` (explicit) | Environment secrets only (Bitwarden machine-account token and/or Cloudflare API token) | Build **and** deploy in the same privileged job (or rebuild then deploy). Prefer Varlock’s Cloudflare path (`@varlock/cloudflare-integration` + `varlock-wrangler`) so secrets land as Worker bindings, not baked plaintext |

**Top ranked option for this repo:** keep the current PR design; implement #148 as test-env compile-only; defer real Bitwarden/Cloudflare to a GitHub Environment–gated deploy job that does not consume PR artifacts; plan migration off explicit `ssrInjectMode: "resolved-env"` toward Varlock’s documented SvelteKit + Cloudflare runtime-binding model (see ranked options below).

---

## Threat model (this repo)

| Threat | What goes wrong | Primary mitigation |
| --- | --- | --- |
| **Malicious PR author / fork PR** | Workflow runs untrusted checkout; if secrets are available, attacker steals tokens or deploys | Use `pull_request` (not `pull_request_target`) for CI that executes PR code; rely on GitHub withholding secrets from fork PRs; never put `BITWARDEN_ACCESS_TOKEN` / Cloudflare tokens in PR jobs |
| **Compromised dependency in a workflow** | Malicious Action or `bun install` postinstall (if scripts enabled) exfiltrates env | Pin Actions by major/sha; `bun install --frozen-lockfile --ignore-scripts` as today; least-privilege `permissions`; Environment secrets only for deploy jobs |
| **Accidental log print of `ENV` / process env** | `console.log`, dump scripts, `echo` of JSON blobs | Mark `@sensitive`; Varlock redaction + varlock-action masking; avoid `output-format: json` job outputs; don’t `::debug` dump env |
| **Deploying the wrong artifact** | CI test build (dummy secrets / localhost `PUBLIC_BASE_URL`) promoted to prod | No artifact promotion from PR → deploy; rebuild under production env in the deploy job; never deploy from PRs ([#148](https://github.com/fringe4life/dollar-holler/issues/148), prior CI note) |
| **Bitwarden token scope** | Over-permissioned machine account → full vault blast radius if CI leaks | Read-only machine account; project-scoped secrets; token only in Environment secrets; revoke/rotate on suspicion ([Bitwarden](https://bitwarden.com/help/machine-accounts/), [access tokens](https://bitwarden.com/help/access-tokens/)) |

---

## What this repo does today

Grounded in tree files (2026-11-01):

| Piece | Behavior |
| --- | --- |
| [`.env.schema`](../.env.schema) | `# @currentEnv=$VARLOCK_ENV`; Bitwarden plugin; `# @encryptInjectedEnv=forEnv(production)`; sensitive items via `bitwarden("…")` / `@sensitive`; `BITWARDEN_ACCESS_TOKEN` required |
| [`.env.test`](../.env.test) | Dummy literals for CI; comment states never real secrets; overrides schema defaults when `VARLOCK_ENV=test` |
| [`bunfig.toml`](../bunfig.toml) | `env = false`; `preload = ["varlock/auto-load"]` so Bun does not race Varlock ([Bun integration](https://varlock.dev/integrations/bun/)) |
| [`vite.config.ts`](../vite.config.ts) | `varlockVitePlugin({ ssrInjectMode: "resolved-env" })`; `@sveltejs/adapter-cloudflare` via `sveltekit({ adapter: … })`; Sentry plugin reads `process.env.SENTRY_AUTH_TOKEN` |
| [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) / [`fallow.yml`](../.github/workflows/fallow.yml) | `VARLOCK_ENV: test`; `bun install --frozen-lockfile --ignore-scripts`; `dmno-dev/varlock-action@v1.0.5`; `permissions: contents: read`; triggers `push` to `main`/`master` and `pull_request` |
| [`package.json`](../package.json) | `varlock@1.23.0`, `@varlock/vite-integration@1.5.4`, `@varlock/bitwarden-plugin@2.0.2`; **no** `@varlock/cloudflare-integration` |
| Deploy | `bun run build && wrangler deploy` locally; **no** GitHub deploy workflow yet ([README](../README.md), [#234](https://github.com/fringe4life/dollar-holler/issues/234)) |

[#148](https://github.com/fringe4life/dollar-holler/issues/148) already states the critical product rule: test-env `bun run build` proves compile; it must not deploy; `ssrInjectMode: "resolved-env"` means a CI artifact embeds dummy secrets and must not be shipped. [#234](https://github.com/fringe4life/dollar-holler/issues/234) elevates that to a cross-cutting Varlock/secrets blocker before deploy-from-CI.

---

## 1. Varlock’s own guidance

### Environments, `VARLOCK_ENV`, and `.env.test`

[Environments](https://varlock.dev/guides/environments/) loads `.env.[currentEnv]` when `@currentEnv` matches. Precedence (increasing): `.env.schema` → `.env` → `.env.local` → `.env.[currentEnv]` → `.env.[currentEnv].local`. Process env always wins over files.

This repo uses `# @currentEnv=$VARLOCK_ENV`. [Builtin variables](https://varlock.dev/reference/builtin-variables/) define `VARLOCK_ENV` as one of `development | preview | staging | production | test`, with CI auto-detection that can infer `production` from `main`/`master`. **Do not rely on auto-detection for CI correctness:** on GitHub Actions without an override, a push to `main` can resolve as `production` and attempt Bitwarden. Both workflows correctly force `VARLOCK_ENV: test`.

Varlock’s environments guide also says test runs should set the env flag explicitly (e.g. `APP_ENV=test` / here `VARLOCK_ENV=test`). Committed `.env.test` dummies are the intended way to satisfy `@required` without a secret-zero.

### Sensitive values, redaction, scan

[Secrets management](https://varlock.dev/guides/secrets/):

- Sensitivity is decorator-driven (`@sensitive` / `@defaultSensitive`), not name prefixes alone. This schema uses `# @defaultSensitive=inferFromPrefix(PUBLIC_)`.
- CLI / `varlock run` redacts sensitive values when stdout is piped (CI logs); runtime integrations patch `console.*`; optional `@redact={stdout=true}` for stream writes.
- **Documented limit:** redaction is a guardrail against accidental exposure by trusted code, **not a sandbox**. Untrusted processes can still exfiltrate plaintext from `process.env`.
- `varlock scan` finds plaintext sensitive values in files / build output (pre-commit or CI).

### Bitwarden plugin

[Bitwarden plugin](https://varlock.dev/plugins/bitwarden/): Secrets Manager via `@initBitwarden(accessToken=$BITWARDEN_ACCESS_TOKEN)` + `bitwarden(uuid)`; machine accounts with **Can read** recommended for most cases; inject the access token from CI/CD secret stores. Password Manager / `bw` CLI path is for local, not CI.

[Bitwarden machine accounts](https://bitwarden.com/help/machine-accounts/) / [access tokens](https://bitwarden.com/help/access-tokens/): tokens decrypt only secrets the machine account can access; tokens are shown once; revoke stops new auth (sessions may last up to ~1 hour). Scope by project + read-only.

When `.env.test` overrides every `bitwarden(...)` item with literals, resolution should not need a live Bitwarden call for those keys—matching #148’s design and the workflow comments.

### `dmno-dev/varlock-action`

[GitHub Actions integration](https://varlock.dev/integrations/github-action/) / [dmno-dev/varlock-action](https://github.com/dmno-dev/varlock-action):

- Loads schema + relevant `.env.*`, validates, exports to the **current job**.
- Sensitive values are exported as GitHub secrets for the run and **masked in logs**; non-sensitive as ordinary env.
- Scope: **job-local only**. Docs warn that `output-format: json` / `json-env` passed between jobs **can leak sensitive data**—prefer re-running the action per job (this repo already does).
- Does not by itself fetch Bitwarden; it resolves whatever the schema + files + process env require. With `VARLOCK_ENV=test` + `.env.test`, no real token is needed.

### Vite `ssrInjectMode: "resolved-env"` and `@varlock/vite-integration`

[Vite integration](https://varlock.dev/integrations/vite/):

- `resolved-env` “injects the fully resolved env data into your built code” (useful when the platform won’t let you wrap the boot command).
- **Don’t use `resolved-env` on Cloudflare builds:** if Cloudflare is detected and `ssrInjectMode` is explicitly `'resolved-env'` for a production build, the plugin **throws** rather than silently shipping resolved (possibly sensitive) values into the worker.
- Default plaintext blob for Vite; encrypt with `@encryptInjectedEnv` ([Encrypted deployments](https://varlock.dev/guides/encrypted-deployments/)). Encryption protects against artifact/sourcemap exposure but **still requires a runtime key** and does not make it safe to deploy a **test-env** build.

[SvelteKit](https://varlock.dev/integrations/sveltekit/) + [Cloudflare Workers](https://varlock.dev/integrations/cloudflare/):

- Documented path: `varlockVitePlugin()` **without** forcing `resolved-env`; install `@varlock/cloudflare-integration`; deploy with `varlock-wrangler deploy`, which uploads non-sensitive as Cloudflare **vars** and sensitive as Cloudflare **secrets**, plus a `__VARLOCK_ENV` binding the SSR loader hydrates at Worker boot.
- Explicitly: secrets should **not** end up bundled into the worker when using the Cloudflare integration correctly.

**Installed package check (`@varlock/vite-integration@1.5.4`):** `detectSvelteKitCloudflareTarget` looks for `@sveltejs/adapter-cloudflare`. If found, it dynamically imports `@varlock/cloudflare-integration/ssr-entry-code`. If that package is missing, it throws _“SvelteKit deploying to Cloudflare requires @varlock/cloudflare-integration”_. If present, it sets `isCloudflareTarget` and then **rejects** explicit `ssrInjectMode: 'resolved-env'` on non-dev, non-prerender builds. This repo currently has the adapter + explicit `resolved-env` and **does not** depend on `@varlock/cloudflare-integration`—so official docs and the installed plugin disagree with the README’s “bake resolved env into the worker” description. Treat migration as a **ship-path prerequisite**, and verify whether `bun run build` still succeeds under current versions before making #148 required (open question below).

This aligns with [docs/alchemy-effect-cloudflare-research.md](./alchemy-effect-cloudflare-research.md) (Varlock vs `platform.env` / Cloudflare loader section), updated for `varlock@1.23` / vite-integration `1.5.4`.

---

## 2. GitHub Actions / Cloudflare practices for env keys

### Secrets availability

[Using secrets in GitHub Actions](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions) / [secret types](https://docs.github.com/en/code-security/reference/secret-security/secret-types):

- Repository / org / environment secrets.
- **“Secrets are not passed to the runner when a workflow is triggered from a forked repository”** (except `GITHUB_TOKEN` with reduced rights).
- Dependabot-triggered workflows do not get Actions secrets (use Dependabot secrets if needed).
- GitHub redacts registered secret values in logs; still avoid printing structured blobs that defeat redaction ([secure use](https://docs.github.com/en/actions/reference/security/secure-use)).

**Implication:** fork PRs already cannot see `BITWARDEN_ACCESS_TOKEN` if it lives only in Actions secrets. Same-repo PRs from collaborators **can** see repository secrets if a job references them—so **do not reference** those secrets in PR CI jobs at all.

### Environments + required reviewers

[Managing environments for deployment](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment):

- Jobs with `environment: name` must satisfy protection rules before running / before receiving environment secrets.
- Required reviewers, wait timers, deployment branch/tag rules, “prevent self-review”.
- Environment secrets are unavailable until rules pass.

**Implication:** put Bitwarden + Cloudflare deploy credentials in a `production` (or `deploy`) Environment, not in repository secrets used by `ci.yml`.

### `pull_request` vs `pull_request_target`

[Securely using pull_request_target](https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target):

- `pull_request` runs the workflow from the PR merge ref with **no** secrets for forks—correct for lint/test/build of untrusted code.
- `pull_request_target` gets base-repo secrets and a privileged token; **unsafe** if it checks out and **executes** PR code (“pwn request”).
- Prefer `pull_request` whenever secrets are not required. GitHub is tightening default policies around `pull_request_target`.

This repo’s CI already uses `pull_request`. **Do not** switch ship/secret jobs to `pull_request_target` to “fix” fork CI.

### Who can trigger what; `workflow_dispatch`

- Collaborator `push` / `workflow_dispatch` can access secrets the workflow references.
- Anyone who can edit workflows can create Environment names via workflow files; only admins configure protection rules—configure the Environment **before** storing secrets.
- Prefer deploy on `push` to protected `main` **or** manual `workflow_dispatch` into an Environment with reviewers—not on every PR.

### OIDC vs long-lived tokens

GitHub documents [OIDC](https://docs.github.com/en/actions/reference/security/oidc) for cloud providers that support it, to avoid long-lived credentials ([secure use](https://docs.github.com/en/actions/reference/security/secure-use)).

Cloudflare’s current [Workers GitHub Actions](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/) guide documents **`CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`** as CI secrets with `cloudflare/wrangler-action@v4` on push to `main`. It does **not** (as fetched 2026-11-01) document GitHub OIDC federation for Wrangler deploy. Practical choice today: **scoped, rotatable API token** stored as an Environment secret; prefer Workers Edit scoped to one account/zone.

### Artifact leakage / Worker secrets

[Cloudflare Workers secrets](https://developers.cloudflare.com/workers/configuration/secrets/): use **secrets** (not Wrangler `vars`) for sensitive values; values are hidden in dashboard/Wrangler after set; can validate required secret names on deploy; `--secrets-file` can upload alongside deploy.

Baking secrets into `_worker.js` (resolved-env without Cloudflare binding upload) means anyone with the build artifact or uploaded sourcemaps can recover them—orthogonal to Cloudflare’s secret store. Sentry source-map upload with a real token is another exfil path if the server bundle contains plaintext env ([prior CI note](./sveltekit-ci-pipeline-research.md)).

### Log redaction

Combine: GitHub secret masking + Varlock `@sensitive` masking via varlock-action + avoid echoing `json-env` / `env | sort` in steps. Varlock’s own docs: redaction won’t catch transformed encodings or untrusted code.

### Branch protections

Require CI status checks on `main`; restrict who can push; for deploy Environments, limit deployment branches to `main` (or release tags). Keeps `workflow_dispatch` from arbitrary branches from promoting if Environment rules are set.

---

## 3. Concrete options ranked for this repo

### Rank 1 — Recommended: two-lane pipeline (status quo PR + gated ship)

**PR / main CI (now + #148):** keep `VARLOCK_ENV=test`, `.env.test`, varlock-action, no Actions secrets for app/Bitwarden/Cloudflare deploy. Add compile-only `bun run build`; turn off Sentry upload when `VARLOCK_ENV=test` (as #148 requires). Discard artifacts.

**Ship (later under #234):** separate workflow/job, `environment: production`, required reviewers, deployment branch = `main`, secrets: `BITWARDEN_ACCESS_TOKEN` (and Cloudflare token if using Wrangler). Explicit `VARLOCK_ENV=production`. Rebuild in that job; deploy with Wrangler or `varlock-wrangler`. Never download PR artifacts for deploy.

**Why first:** Matches GitHub’s fork-secret model, Varlock’s test-env file pattern, #148/#234 text, and the prior CI research note. Minimizes blast radius of Bitwarden token.

### Rank 2 — Align ship builds with Varlock’s Cloudflare integration (strongly preferred before prod CI deploy)

Install `@varlock/cloudflare-integration`; remove explicit `ssrInjectMode: "resolved-env"` (or set `init-only` only if documented for this path); deploy via `varlock-wrangler deploy` so sensitive values become Cloudflare secrets / `__VARLOCK_ENV` bindings ([SvelteKit](https://varlock.dev/integrations/sveltekit/), [Cloudflare](https://varlock.dev/integrations/cloudflare/), [encrypted deployments](https://varlock.dev/guides/encrypted-deployments/)). Keep `@encryptInjectedEnv=forEnv(production)` only if still relevant for non-CF targets; on CF, `varlock-wrangler` manages the binding key story.

**Why second (but do before trusting prod artifacts):** Official guidance says resolved-env on CF is wrong; installed 1.5.4 plugin encodes that. Fixes the “baking secrets into the worker” class of leak for production.

### Rank 3 — Keep resolved-env for ship builds + `@encryptInjectedEnv` (interim only)

If migration to Rank 2 slips, production CI build must set `_VARLOCK_ENV_KEY`, enable encryption for production, treat the worker artifact as **secret material** (no public artifact retention, careful Sentry uploads). Still never deploy test-env builds. **Weaker** than Rank 2: key + ciphertext still coexist in the deploy path; conflicts with Varlock’s CF throw/guidance once `cloudflare-integration` is added.

### Rank 4 — Resolve secrets only at deploy time via Cloudflare dashboard / `wrangler secret put`

Build with public/non-secret config only; set `BETTER_AUTH_SECRET` / etc. as Worker secrets out-of-band. Conflicts with current schema’s `bitwarden(...)` + `ENV` from varlock at build/runtime unless the Cloudflare loader path (Rank 2) or runtime bindings are wired. Higher manual ops cost; only a partial fit.

### Rank 5 — Put Bitwarden token in repository secrets and reuse one workflow for PR + deploy

**Reject.** Same-repo PR jobs could read the token; fork protections don’t help collaborator PRs; accidental `env:` wiring is easy; violates #234’s “must not expose to fork PRs” and least privilege.

### Rank 6 — `pull_request_target` + secrets for “full” PR CI

**Reject.** Classic pwn-request pattern if checkout+build runs ([GitHub docs](https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target)).

---

## What this repo should / should not do (tied to #148 / #234)

### Should

1. **Keep PR CI on `VARLOCK_ENV=test` + `.env.test` + varlock-action without Bitwarden / Cloudflare / Sentry deploy secrets** (#148, #234, current `ci.yml` / `fallow.yml`).
2. **Implement #148 as compile-only** on that test env; disable Sentry source-map upload when `VARLOCK_ENV=test`; never `wrangler deploy` / `versions upload` from PR workflows (extends [sveltekit-ci-pipeline-research.md](./sveltekit-ci-pipeline-research.md)).
3. **Treat any worker built under test env as non-shippable**—dummy `BETTER_AUTH_SECRET` / localhost `PUBLIC_BASE_URL` are embedded under current `resolved-env` (#148).
4. **Before deploy-from-CI (#234):** add a GitHub Environment with required reviewers + branch filter; store `BITWARDEN_ACCESS_TOKEN` and Cloudflare credentials there; rebuild under `VARLOCK_ENV=production` in that job only.
5. **Prefer Rank 2 (Cloudflare integration + `varlock-wrangler`)** so production secrets are Worker bindings, not baked plaintext—matching current Varlock SvelteKit/CF docs.
6. **Scope Bitwarden machine accounts to Can read** and only the projects this app needs; separate tokens for local vs CI if practical ([Bitwarden](https://bitwarden.com/help/machine-accounts/), [plugin](https://varlock.dev/plugins/bitwarden/)).
7. **Keep `permissions: contents: read` on PR workflows**; raise permissions only on deploy jobs that need them.
8. **Keep re-running varlock-action per job**; do not pass `json-env` between jobs ([varlock-action docs](https://varlock.dev/integrations/github-action/)).

### Should not

1. **Should not** call Bitwarden or inject `BITWARDEN_ACCESS_TOKEN` in PR-proof CI.
2. **Should not** deploy or `versions upload` from `pull_request`.
3. **Should not** promote PR / test-env build artifacts to production.
4. **Should not** use `pull_request_target` to obtain secrets for building PR code.
5. **Should not** dump resolved env / `json-env` into logs or Actions outputs.
6. **Should not** assume `@encryptInjectedEnv=forEnv(production)` alone makes a baked worker safe to publish or that it applies under `VARLOCK_ENV=test` (it does not encrypt test builds).
7. **Should not** leave README’s “bake secrets into the worker” story as the long-term production model without reconciling Rank 2 and the 1.5.4 plugin throw.

### #233 note

Dependency audit gates do not need Bitwarden or resolved production env. They can stay on the test-env scaffolding (or even skip varlock if the job never imports app env)—orthogonal to this secrets strategy.

---

## Open questions / unverified

1. **Does `bun run build` succeed today** with `varlockVitePlugin({ ssrInjectMode: "resolved-env" })` + inline `@sveltejs/adapter-cloudflare` + **no** `@varlock/cloudflare-integration` under `@varlock/vite-integration@1.5.4`? Plugin source suggests detection may throw requiring the CF package, or may fail to see the adapter depending on Kit 3 plugin API shape. **Must verify before #148 is required.**
2. **Sentry + dummy token:** still unverified whether `ci-dummy-sentry-token` fails `vite build` (carried from [sveltekit-ci-pipeline-research.md](./sveltekit-ci-pipeline-research.md); #148 already plans `autoUploadSourceMaps: false` for test).
3. **Whether `bitwarden()` resolvers short-circuit** when `.env.test` overrides all values—or whether a malformed dummy `BITWARDEN_ACCESS_TOKEN` still triggers a network init. Empirically CI is green today; confirm against plugin behavior if schema adds a required Bitwarden-only item without a `.env.test` override.
4. **Cloudflare OIDC for Wrangler:** not documented on the Workers GitHub Actions page fetched for this note; recheck periodically before investing in custom federation.
5. **Workers Builds vs Actions:** Varlock documents dashboard Deploy command override to `varlock-wrangler deploy` and secret-zero under Build variables. If the project ever uses Workers Builds, that path needs the same “no PR secrets / production only” discipline—out of scope until chosen.
6. **Exact masking behavior** of varlock-action `v1.0.5` vs docs written against `v1.0.1`—assumed same contract; pin and skim release notes on bump.
7. **Artifact retention defaults** if a future job uploads `.svelte-kit/cloudflare`—confirm GitHub Actions artifact visibility for public repos before enabling uploads.

---

## Sources

### This repo

- `.env.schema`, `.env.test`, `bunfig.toml`, `vite.config.ts`, `package.json`, `.github/workflows/ci.yml`, `.github/workflows/fallow.yml`, `README.md`
- [docs/sveltekit-ci-pipeline-research.md](./sveltekit-ci-pipeline-research.md)
- [docs/alchemy-effect-cloudflare-research.md](./alchemy-effect-cloudflare-research.md) (Varlock Cloudflare loader section)
- Issues [#148](https://github.com/fringe4life/dollar-holler/issues/148), [#234](https://github.com/fringe4life/dollar-holler/issues/234), [#233](https://github.com/fringe4life/dollar-holler/issues/233)
- Installed `@varlock/vite-integration@1.5.4` (`dist/index.mjs` Cloudflare detection / `resolved-env` throw)

### Varlock

- [Secrets management](https://varlock.dev/guides/secrets/)
- [Environments](https://varlock.dev/guides/environments/)
- [Builtin variables / `VARLOCK_ENV`](https://varlock.dev/reference/builtin-variables/)
- [Encrypted deployments](https://varlock.dev/guides/encrypted-deployments/)
- [Vite integration](https://varlock.dev/integrations/vite/)
- [SvelteKit integration](https://varlock.dev/integrations/sveltekit/)
- [Cloudflare Workers integration](https://varlock.dev/integrations/cloudflare/)
- [GitHub Action](https://varlock.dev/integrations/github-action/)
- [Bitwarden plugin](https://varlock.dev/plugins/bitwarden/)
- [dmno-dev/varlock-action](https://github.com/dmno-dev/varlock-action)

### GitHub

- [Using secrets in GitHub Actions](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [Understanding GitHub secret types](https://docs.github.com/en/code-security/reference/secret-security/secret-types)
- [Managing environments for deployment](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [Securely using pull_request_target](https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target)
- [Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use)
- [OpenID Connect reference](https://docs.github.com/en/actions/reference/security/oidc)

### Cloudflare

- [Workers secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [GitHub Actions (external CI/CD)](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)

### Bitwarden

- [Machine accounts](https://bitwarden.com/help/machine-accounts/)
- [Access tokens](https://bitwarden.com/help/access-tokens/)
