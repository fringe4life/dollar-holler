# GitHub Actions workflows

Proof gates only — **no deploy from Actions**. Local ship is `bun run deploy`. Details: [docs/ci.md](../../docs/ci.md).

## Other hardening

Settings rows are **not** proven by this file — confirm in the linked UI.

| Control | Where | Status |
| --- | --- | --- |
| Default `GITHUB_TOKEN` read-only | Actions → General → Workflow permissions | Confirm in Settings (prefer Read) — human checklist below |
| Selected / allowlisted actions | Actions → General → Actions permissions | Optional follow-up — human checklist below |
| Egress firewall | `.github/egress-firewall.yaml` + `runs-on: ubuntu-24.04-firewall` | Phase 1: `mode: log`; then `enforce` + allowlist |
| SHA-pinned actions | workflow `uses:` lines | Done in #325 (`persist-credentials: false`, bun cache, zizmor) |
| Lockfile / deps gates | CI `audit` job | `bun run dedupe:check` + `bun run audit:deps` |

## Egress firewall

- Policy file: [`.github/egress-firewall.yaml`](../egress-firewall.yaml) (must live there — not under `workflows/`)
- Runner: `ubuntu-24.04-firewall` (technical preview; ~15–20% slower; log mode can still break some TLS clients)
- **Phase 1:** `mode: log` only — traffic is recorded, not denied. Candidate Phase 2 hosts are commented in the YAML (Bun/npm, GitHub APIs, BundleWatch, Varlock; Cloudflare/Sentry only if artifacts show them)
- **Phase 2:** set `mode: enforce` and copy confirmed hosts into `allow` from `firewall-decisions-*` artifacts (job summary + run artifact)
- **Who can widen policy:** [CODEOWNERS](../CODEOWNERS) owns itself and `egress-firewall.yaml` (`@fringe4life`). That only **enforces** when the ruleset/branch protection option **Require a pull request before merging → Require review from Code Owners** is on (see checklist). No org-level egress ceiling in the preview
- Preview logs: job summary + run artifact — when a needed host is blocked under enforce, add it under `allow` with a comment naming the job/tool
- Ref: [Actions native egress firewall](https://github.com/github-early-access/actions-native-egress-firewall)

## Write blast radius (post-#325)

Job/workflow `write` scopes that remain after hardening:

| Workflow | Write scope | Why kept |
| --- | --- | --- |
| bundlewatch | `statuses: write` | BundleWatch posts the `bundlewatch` commit status via `GITHUB_TOKEN` |

`cache-mode` is not used here. Composite `actions/cache/save` is an Actions cache write, not a `GITHUB_TOKEN` scope. Zizmor uses `advanced-security: false` so it does **not** need `security-events: write`. No extra `GITHUB_TOKEN` scopes were added for the firewall runner (`contents: read` already loads the policy file).

## Human Settings checklist

Agents cannot click these. Confirm in the UI (repo and, if you want org defaults, org admin):

### Repo — Actions General

1. Open [Settings → Actions → General](https://github.com/fringe4life/dollar-holler/settings/actions)
2. **Workflow permissions:** choose **Read repository contents and packages permissions** (read-only `GITHUB_TOKEN` default). Uncheck “Allow GitHub Actions to create and approve pull requests” unless you have a concrete need
3. **Actions permissions:** prefer **Allow fringe4life, and select non-fringe4life, actions and reusable workflows**. Add required third-party actions (`oven-sh/setup-bun`, `dmno-dev/varlock-action`, `zizmorcore/zizmor-action`, `actions/*`) to the allowlist. Do **not** use “Allow all actions” long-term
4. Save changes

### Repo — Actions Policies (lockfile)

1. Open [Settings → Actions → Policies](https://github.com/fringe4life/dollar-holler/settings/actions/policies)
2. **Require lockfile** is optional here — this repo SHA-pins `uses:` (no `actions.lock` yet). Enable only after a lockfile is on `main`
3. Confirm the policy shows **Active** before assuming unlocked workflows are blocked

### Repo — Rulesets / branch protection (CODEOWNERS enforce)

Without a ruleset, CODEOWNERS is advisory only.

1. Open [Settings → Rules → Rulesets](https://github.com/fringe4life/dollar-holler/settings/rules)
2. Target `main`
3. **Require a pull request before merging** + **Require review from Code Owners**
4. Confirm edits to `.github/egress-firewall.yaml` / `.github/CODEOWNERS` request `@fringe4life`

### Org (optional; needs org admin)

Org-level Actions defaults and Policies **cannot** be set from this repository’s YAML. An org admin would:

1. Open `https://github.com/organizations/fringe4life/settings/actions`
2. Align org defaults with Socket Ch.2: read-only default `GITHUB_TOKEN`, restricted actions posture, and any org-level Policies that should cascade to this repo
3. There is **no** org-level egress ceiling in the native firewall technical preview — repo YAML + CODEOWNERS remain the control

## Socket reference

[Hardening GitHub Actions Against Outside Threats](https://socket.dev/blog/hardening-github-actions-against-outside-threats) — first pass #325 (pin + persist-credentials + cache + zizmor); this file is the egress + Settings follow-up.
