---
name: fallow
description: Codebase intelligence for TypeScript and JavaScript. Static analysis reports changed-code risk, cleanup opportunities, duplication, circular dependencies, complexity hotspots, architecture boundaries, design-system drift, feature flags, and opt-in security candidates. Optional local similar-code discovery finds functions that may implement the same intent despite different syntax. Runtime coverage can merge production execution data. Use when asked to audit PR risk, find unused code or dependencies, compare semantically similar functions, detect duplicates, inspect architecture boundaries, merge runtime coverage, auto-fix supported issues, or run fallow.
license: MIT
metadata:
  fallow_skill: pointer
  fallow_version: "3.22.0"
---

# Fallow (project pin 3.22.0)

Pointer to the fallow skill this repo pins so it cannot drift from `fallow@3.22.0`.

**Read and follow** `node_modules/fallow/skills/fallow/SKILL.md`.

## This repo

- Prefer MCP tools on the `fallow` server in `.cursor/mcp.json` (`audit`, `check_changed`, `inspect_target`, `trace_*`, `get_token_blast_radius`, `check_health` with `css: true`). CLI is fallback.
- `styled-system/` is gitignored. Run `bun run fallow:prepare` (or any `fallow:*` script) before CLI analysis if that folder is missing. Cursor commit/stop gates do this automatically.
- `bunfig.toml` preloads varlock. Do not launch `fallow-mcp` via `bun x` — the MCP entry uses `node_modules/.bin/fallow-mcp` (node shebang) so varlock does not run.
- Never enable telemetry. You MAY set `FALLOW_AGENT_SOURCE=cursor`.
- Do not overwrite Ultracite `AGENTS.md`.
