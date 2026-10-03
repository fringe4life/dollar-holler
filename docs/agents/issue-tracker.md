# Issue tracker: GitHub

Issues and specs for this repo live as **GitHub Issues** on `fringe4life/dollar-holler`.

## CLI / MCP failover

1. Prefer `gh` when authenticated.
2. If `gh` fails (auth / Forbidden / network) — or already failed this chat — use **GitKraken MCP** (`issues_create`, `issues_get_detail`, `issues_add_comment`, etc.) on provider `github`, org `fringe4life`, repo `dollar-holler`.
3. If both fail, stop and tell the user. No third client. No retry loops.

## Conventions

- **Create**: `gh issue create` **or** GitKraken `issues_create`.
- **Read**: `gh issue view <n> --comments` **or** GitKraken `issues_get_detail`.
- **List**: `gh issue list` **or** GitKraken list tools scoped to this repo.
- **Comment / close**: `gh` equivalents **or** GitKraken comment/close tools when available.

Infer the repo from `git remote -v`.

## Pull requests as a triage surface

**PRs as a request surface: no.**

## When a skill says "publish to the issue tracker"

Create a GitHub issue (via `gh` or GitKraken per failover above).

## When a skill says "fetch the relevant ticket"

`gh issue view <number> --comments` or GitKraken `issues_get_detail`.

## Wayfinding operations

Used by `/wayfinder`. Map = issue labelled `wayfinder:map`; children via sub-issues or task lists. Blocking: native GitHub dependencies when available, else `Blocked by: #n` in the body. Prefer GitKraken when `gh` auth is down.
