# Fallow + Cursor MCP + hooks

**Date:** 2026-09-07

**Pin:** `fallow@3.22.0`, `@pandacss/mcp@2.0.0-beta.15`

**Question:** Wire Fallow into Cursor the way the official stack intends (skill + MCP + CLI fallback), add the Cursor-native commit/stop gate Fallow will not install, then expose Panda CSS MCP from the local pin.

**Method:** Primary sources: [docs.fallow.tools/llms.txt](https://docs.fallow.tools/llms.txt), [Agent integration (MCP)](https://docs.fallow.tools/integrations/mcp.md), [`fallow agent`](https://docs.fallow.tools/cli/agent.md), [Agent Skills](https://docs.fallow.tools/integrations/agent-skills.md), [environment variables](https://docs.fallow.tools/configuration/environment.md), [Claude Code hooks](https://docs.fallow.tools/integrations/claude-hooks.md), [Panda MCP](https://panda-css.com/docs/ai/mcp-server), [Cursor MCP](https://cursor.com/docs/context/mcp.md), [Cursor hooks](https://cursor.com/docs/agent/hooks.md), [Cursor Cloud Agents](https://cursor.com/docs/cloud-agent.md), [Cloud Agent capabilities](https://cursor.com/docs/cloud-agent/capabilities.md). Local evidence: `fallow agent status --format json` and `fallow agent install --harness cursor --dry-run --format json` against fallow **3.22.0**. No blogs.

---

## Verdict

Fallow already ships a first-class Cursor MCP server (`fallow-mcp`, stdio). This repo pins fallow 3.22.0, has the binary, `.fallowrc.json`, CI boundary job, and `bun run fallow:*` scripts. **MCP, a project skill pointer, and Cursor hooks are the Cursor layer.** Official one-command wire-up is `fallow agent install --harness cursor`, but a blind run here would append a fallow task-map to Ultracite `AGENTS.md` and write `npx` into `.cursor/mcp.json`. Cursor **cannot** use Fallow's Claude/Codex commit gate; Cursor-native hooks fill that gap.

Four official layers, complementary:

| Layer | What it is | This repo |
| --- | --- | --- |
| CLI | Shell JSON (`fallow --format json`) | Yes (`bun run fallow`, `fallow:*` scripts, CI Action) |
| Skill | Teaches when/how to call fallow | Yes (`.agents/skills/fallow` pointer to `node_modules/fallow/skills/fallow`) |
| MCP | Typed tools, no CLI text parsing | Yes (`.cursor/mcp.json` `fallow` + `panda`) |
| LSP / VS Code extension | Human diagnostics, Code Lens, health sidebar | Binary present (`fallow-lsp`), extension not recommended |

Official stance: CLI is primary; MCP is optional structured layer; best agent experience is **skill + MCP + CLI fallback**. ([mcp.md](https://docs.fallow.tools/integrations/mcp.md), [agent-skills.md](https://docs.fallow.tools/integrations/agent-skills.md))

Panda MCP is a separate server: tokens, recipes, patterns, usage. Pair it with Fallow `get_token_blast_radius` / `check_health` (`css: true`).

---

## This repo

Facts from the tree + `fallow agent status` (fallow 3.22.0):

- `fallow@3.22.0` and `@pandacss/mcp@2.0.0-beta.15` in `devDependencies`. npm `fallow` package also ships `fallow-mcp` and `fallow-lsp` (`package.json` `bin` + `"mcpName": "io.github.fallow-rs/fallow"`).
- Local binaries: `node_modules/.bin/fallow`, `fallow-mcp`, `fallow-lsp`, `panda-mcp`.
- Config: `.fallowrc.json` (boundaries, dupes, health caps). `styled-system/` is gitignored; `bun run fallow:prepare` (`svelte-kit sync` + `panda build`) must exist before analysis.
- `bunfig.toml` sets `preload = ["varlock/auto-load"]` and `env = false`. Any `bun` / `bun x` process loads Varlock. MCP stdio servers therefore use **node shebang bins**, not `bun x`.
- `AGENTS.md` is Ultracite, **no fallow task-map block**. Do not let the installer append one.
- `.cursor/mcp.json` is tracked. Fallow, Panda, and ESLint MCP use local `node` + `args` bins. svelte-devtools stays remote.
- Cursor hooks: Ultracite-style `afterFileEdit` (`bun run fix`) + Fallow `beforeShellExecution` + Fallow `stop`.
- Human git: Husky → lint-staged (ESLint / Prettier / Stylelint / `svelte-check`). No fallow on staged files.
- CI: `.github/workflows/fallow.yml` runs `bun run fallow:boundary-violations` with `VARLOCK_ENV=test`.

`fallow agent install --harness cursor --dry-run` plan (not run unattended):

| Step | Status | Path | Note |
| --- | --- | --- | --- |
| `guide` | would write | `AGENTS.md` | Appends fallow task-map. Ultracite owns this file. Skipped on purpose. |
| `skill` | would write | `.agents/skills/fallow` | Pointer to `node_modules/fallow/skills/fallow`. Written by hand as a pin-pointer. |
| `mcp` | would write | `.cursor/mcp.json` | Would add `npx` (wrong). Hand-written bun-safe node bins instead. |
| `hooks` | **skipped** | — | `unsupported_harness`: "Cursor's beforeShellExecution hook uses a different contract; Cursor still reads AGENTS.md" |

Installer is idempotent and marker-based. Foreign MCP entries are refused without `--force`. ([agent.md](https://docs.fallow.tools/cli/agent.md))

---

## MCP: what Cursor actually gets

`fallow-mcp` is stdio. Thin `rmcp` wrapper around the CLI binary. Same JSON envelopes as CLI. `FALLOW_BIN` locates `fallow` (env → sibling binary → `PATH`). Default subprocess timeout 120s (`FALLOW_TIMEOUT_SECS`). Exit 1 (issues found) is success for MCP; exit 2+ is error. ([mcp.md](https://docs.fallow.tools/integrations/mcp.md))

Cursor project config is `.cursor/mcp.json`, `mcpServers` map, stdio via `command`/`args`/`env`. Interpolation: `${workspaceFolder}`, `${env:NAME}`. Agent uses tools in Agent/Plan modes. Destructive tools go through Cursor approval / Auto-review. ([Cursor MCP](https://cursor.com/docs/context/mcp.md))

### Why not `bun x fallow-mcp` / `npx -y @pandacss/mcp`

Official Fallow bun snippet is `bunx fallow-mcp`. Official Panda snippet is `npx -y @pandacss/mcp`. Both are wrong here:

- `bun x` loads `bunfig.toml` Varlock preload. MCP startup can hang on Bitwarden or fail without env.
- `npx -y @pandacss/mcp` ignores the pinned `2.0.0-beta.15` in `package.json`.
- Installer MCP probe is `npx --no fallow-mcp`, then `PATH`, then the multicall binary — **not** the local node bin with `FALLOW_BIN`.

Workspace path has a space (`Svelte 5`). Cursor stdio spawn splits `command` on whitespace, so `${workspaceFolder}/node_modules/.bin/fallow-mcp` becomes `spawn /home/cc/Programming/Svelte` → `ENOENT`. Put the binary in `args` (one argv element). `node` has no spaces:

```json
{
  "mcpServers": {
    "eslint": {
      "command": "node",
      "args": ["${workspaceFolder}/node_modules/.bin/mcp"],
      "cwd": "${workspaceFolder}"
    },
    "fallow": {
      "command": "node",
      "args": ["${workspaceFolder}/node_modules/.bin/fallow-mcp"],
      "cwd": "${workspaceFolder}",
      "env": {
        "FALLOW_BIN": "${workspaceFolder}/node_modules/.bin/fallow",
        "FALLOW_AGENT_SOURCE": "cursor"
      }
    },
    "panda": {
      "command": "node",
      "args": [
        "${workspaceFolder}/node_modules/.bin/panda-mcp",
        "--cwd",
        "${workspaceFolder}"
      ],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

`fallow-mcp` and `panda-mcp` are `#!/usr/bin/env node` shims. They do not load bunfig. `FALLOW_AGENT_SOURCE=cursor` only attributes telemetry **if** the user already enabled it. Agents must not run `fallow telemetry enable`. ([environment.md](https://docs.fallow.tools/configuration/environment.md), fallow skill rule 11)

Panda loads `panda.config.ts` from cwd. Do not run `npx -y @pandacss/mcp init` — it would rewrite this file with `npx`.

Optional Fallow MCP `env` (inherited by spawned CLI):

| Var | Why |
| --- | --- |
| `FALLOW_BIN` | Pin the 3.22.0 local binary |
| `FALLOW_TIMEOUT_SECS` | Raise for huge dumps / `check_runtime_coverage` |
| `FALLOW_AGENT_SOURCE` | `cursor` |
| `FALLOW_CHANGED_SINCE` | Default git-ref scope for analysis tools |
| `FALLOW_DIFF_FILE` | Line-level diff scoping |
| `FALLOW_SUGGESTIONS` | `off` to drop `next_steps[]` |
| `FALLOW_AUDIT_BASE` | Pin audit base for forks / worktrees |
| `FALLOW_COVERAGE` / `FALLOW_COVERAGE_ROOT` | Istanbul dump + path rebase; tool params win |

Do **not** set `FALLOW_INTEGRATION_SURFACE` or `FALLOW_MCP_TOOL` in `env` — the MCP server stamps those on the CLI it spawns. ([environment.md](https://docs.fallow.tools/configuration/environment.md))

Fallow MCP also exposes **resources** (no subprocess): `fallow://tools`, `fallow://issue-types`, `fallow://explain/{issue_type}`, `fallow://task-matrix`, plus schema URIs. Cursor lists Resources as supported.

Toggle servers in Cursor Customize. Confirm tools in **MCP Logs**. Start the agent from the project root so `${workspaceFolder}` resolves.

### Fallow tools (3.22.0)

Prefer MCP once connected. CLI remains fallback and the only path for write-only setup (`init`, `hooks install`, `license activate`).

| Tool | Use |
| --- | --- |
| `analyze` / `check_changed` / `audit` | Dead code / incremental / PR verdict |
| `inspect_target` | One file or export: trace + dead-code + dupes + complexity + security in one bundle |
| `code_execute` | Read-only JS sandbox composing multiple fallow calls (`fallow.run(tool, params)`). No fs/network/shell. Mutating fix tools not exposed |
| `recommend` | Cold-start config proposal (`auto` / `default` / `taste`) |
| `decision_surface` | Ranked structural review questions (coupling, public API, new dep) |
| `security_candidates` | Unverified local candidates |
| `trace_symbol` / `symbol_impact` | Type-aware exact-symbol proof (`trace_symbol`, not `symbol_trace`) |
| `get_token_blast_radius` | Static design-token consumers. **PandaCSS `defineTokens` is a documented consumer kind** |
| `check_health` (`css: true`) | CSS + Panda token reverse index |
| `find_dupes` / `trace_clone` | Duplication + fingerprint deep-dive |
| `fix_preview` / `fix_apply` | Dry-run then apply. `fix_apply` is destructive — keep behind Cursor approval |
| `trace_export` / `trace_file` / `trace_dependency` | Before deleting "unused" things |
| `feature_flags` / `list_boundaries` / `list_suppressions` / `project_info` | Inventory |
| `check_runtime_coverage` + `get_hot_paths` / `get_blast_radius` / `get_importance` / `get_cleanup_candidates` | Runtime. One local capture free; continuous/cloud paid |
| `impact` / `impact_closure` / `impact_all` | Read-only local value report. Do not enable tracking for the user |
| `guard` | Boundary zone + allowed imports for files about to be edited |

`next_steps[]` on analyze/health/dupes/audit maps `id` → MCP tool (`trace_export`, `trace_clone`, `audit`, `code_execute`), not a shell string.

If `styled-system/` is missing, MCP analysis of `#styled-system/*` imports is wrong. Run `bun run fallow:prepare` once (or `bun run dev` / `panda:build`). Commit/stop gates run prepare only when that folder is absent.

### Panda tools (local `@pandacss/mcp`)

| Tool | Use |
| --- | --- |
| `get_tokens` | Token values, CSS variables, usage examples (`category?`) |
| `get_semantic_tokens` | Conditional / dark-mode / responsive tokens |
| `get_color_palette` | Full color palette |
| `get_recipes` | Component recipes + variants (`name?`) |
| `get_patterns` | Layout patterns (`name?`) |
| `get_conditions` | Breakpoints, pseudos, color modes |
| `get_keyframes` / `get_text_styles` / `get_layer_styles` / `get_animation_styles` | Theme compositions |
| `get_config` | Resolved Panda config |
| `get_usage_report` | Token/recipe usage (`scope`: `all` / `token` / `recipe`) |

Before renaming a Panda token: `get_tokens` / `get_usage_report`, then Fallow `get_token_blast_radius`.

---

## Cursor hooks (the Cursor gate)

Fallow's agent installer **skips** Cursor hooks. Claude gets `PreToolUse` + `fallow-gate.sh` (`fallow audit --gate-marker agent`). Cursor's `beforeShellExecution` contract is different: JSON `{ command, cwd, sandbox }` in, `{ permission, user_message, agent_message }` out. ([agent.md](https://docs.fallow.tools/cli/agent.md), [claude-hooks.md](https://docs.fallow.tools/integrations/claude-hooks.md), [hooks.md](https://cursor.com/docs/agent/hooks.md))

This repo's `.cursor/hooks.json`:

| Event | Command | Role |
| --- | --- | --- |
| `afterFileEdit` | `bun run fix` | ESLint / Prettier / Stylelint. Not Fallow. |
| `beforeShellExecution` | `.cursor/hooks/fallow-gate.sh --event beforeShellExecution` (matcher `\bgit\b`, timeout 180s) | Deny `git commit` / `git push` when audit `verdict` is `fail` |
| `stop` | `.cursor/hooks/fallow-gate.sh --event stop` (timeout 180s, `loop_limit` 3) | If agent completes with a failing changeset, auto-submit a follow-up with the JSON findings |

Shared implementation: `.cursor/hooks/fallow-gate.ts` (Bun). Wrapper `.cursor/hooks/fallow-gate.sh` sets `VARLOCK_ENV=test` unconditionally **before** Bun starts so Varlock preload does not hit Bitwarden.

Gate semantics match Claude's official script:

- `fallow audit --format json --quiet --explain --gate-marker agent`
- Default `gate=new-only`: only findings the changeset introduces fail the gate
- `pass` / `warn` allowed; `verdict: "fail"` blocked
- Runtime errors (`error: true`, exit 2, invalid JSON, missing binary) **fail open**
- Version floor `FALLOW_GATE_MIN_VERSION` (default `2.85.0`) **fail closed** — older binaries reject `--gate-marker`
- Git detection uses command position (after `KEY=value` and wrappers like `sudo`/`env`) so `git -c k=v commit` and `/usr/bin/git push` still gate; `echo git commit` and `git log commit-message.txt` do not
- If `styled-system/` is missing, runs `bun run fallow:prepare` first (Cloud Agents clone without that folder)

`stop` input is `{ status, loop_count }`. Follow-up only when `status === "completed"` and the audit fails. Cursor submits `followup_message` as the next user message. Cap is `loop_limit` 3. Do **not** run Fallow on every `afterFileEdit`.

Cursor stdin for shell is `.command`, not Claude's `.tool_input.command`. Do not copy `.claude/hooks/fallow-gate.sh` verbatim.

### Manual check

```bash
echo '{"command":"git status"}' | .cursor/hooks/fallow-gate.sh --event beforeShellExecution
# {"permission":"allow"}

echo '{"status":"aborted","loop_count":0}' | .cursor/hooks/fallow-gate.sh --event stop
# {}
```

Confirm in Cursor **Hooks** settings / Hooks output channel after reload.

---

## Deeper than MCP

### LSP / VS Code extension (human loop)

`fallow-lsp` is in `node_modules/.bin`. Extension id `fallow-rs.fallow-vscode`: inline diagnostics, Code Lens ref counts, health/security/audit status bar, JSON schema for `.fallowrc.json`. Cursor installs third-party extensions from **Open VSX**. Installing the extension does **not** register `fallow-mcp`. Human vs agent. They do not replace each other. Not in `.vscode/extensions.json`.

### AGENTS.md task map

`fallow init --agents` / `fallow agent install` writes a task-to-command matrix. Cursor reads `AGENTS.md`. Installer **appends a marked block**. Safe path: keep Ultracite `AGENTS.md`. Skill + MCP + hooks are enough.

### Cloud Agents

Cloud Agents **do not read repo `.cursor/mcp.json`**. Configure MCP in the [cursor.com/agents](https://cursor.com/agents) dropdown and/or **Dashboard → Integrations & MCP**. HTTP or stdio; SSE / `mcp-remote` not supported. HTTP recommended (tools proxied; creds never in the VM). Fallow does **not** document a hosted HTTP MCP. Panda MCP is stdio-only too.

Repo hooks from `.cursor/hooks.json` run once the VM is writable; `~/.cursor/hooks.json` does **not**. `beforeMCPExecution` / `afterMCPExecution` are **deferred** for cloud. Cloud checkout has no `styled-system/`; the gate wrapper will `fallow:prepare` (needs Bun + `VARLOCK_ENV=test` / dummy `.env.test`).

### Approval / tool budget

Fallow MCP exposes many tools. Cursor Auto-review should allowlist read-only (`analyze`, `audit`, `inspect_target`, `trace_*`, `check_health`, Panda `get_*`) and keep `fix_apply` on ask. Panda + Fallow is a natural pair (Panda tokens ↔ `get_token_blast_radius`).

---

## Skills vs MCP vs CLI vs LSP

|  | Skill | MCP | CLI | LSP |
| --- | --- | --- | --- | --- |
| Provides | Knowledge | Typed tools | Any shell agent | Editor diagnostics |
| This repo | Project pointer | Fallow + Panda | `bun run fallow:*` | Binary present |
| Best for | Routing intent | Agent frameworks | CI, fallback, prepare | Human squiggles / Code Lens |

Skill still tells the agent `--format json --quiet` + `|| true` for CLI. Once MCP is connected, prefer MCP tools.

---

## What was applied

1. **`.cursor/mcp.json`** — `fallow`, `panda`, and `@eslint/mcp` via local `node` + `args` bins (space-safe). svelte-devtools left as HTTP.
2. **`.agents/skills/fallow`** — pointer at fallow 3.22.0. Ultracite `AGENTS.md` untouched.
3. **Cursor gate** — `beforeShellExecution` on git commit/push + `stop` follow-up, same `new-only` fail-on-`verdict: fail` semantics as Claude's fallow-gate.
4. **Varlock-safe launch** — no `bun x` for MCP; hook wrapper exports `VARLOCK_ENV=test`.

Not applied (optional):

- `fallow-rs.fallow-vscode` in `.vscode/extensions.json`
- Fallow on lint-staged / a full CI `fallow audit` job (CI today is boundaries only)
- Cloud dashboard MCP for Fallow/Panda (needed only if Cloud Agents should call those tools)

After MCP is live in Customize: `audit` / `check_changed` after feature work; `inspect_target` before deleting an export; `trace_symbol` / `symbol_impact` for type-aware renames; `get_token_blast_radius` + Panda `get_usage_report` before token edits; `fix_preview` then user-approved `fix_apply`.

---

## Sources

- [https://docs.fallow.tools/integrations/mcp.md](https://docs.fallow.tools/integrations/mcp.md)
- [https://docs.fallow.tools/cli/agent.md](https://docs.fallow.tools/cli/agent.md)
- [https://docs.fallow.tools/integrations/agent-skills.md](https://docs.fallow.tools/integrations/agent-skills.md)
- [https://docs.fallow.tools/configuration/environment.md](https://docs.fallow.tools/configuration/environment.md)
- [https://docs.fallow.tools/integrations/claude-hooks.md](https://docs.fallow.tools/integrations/claude-hooks.md)
- [https://docs.fallow.tools/integrations/vscode.md](https://docs.fallow.tools/integrations/vscode.md)
- [https://docs.fallow.tools/integrations/index.md](https://docs.fallow.tools/integrations/index.md)
- [https://panda-css.com/docs/ai/mcp-server](https://panda-css.com/docs/ai/mcp-server)
- [https://cursor.com/docs/context/mcp.md](https://cursor.com/docs/context/mcp.md)
- [https://cursor.com/docs/agent/hooks.md](https://cursor.com/docs/agent/hooks.md)
- [https://cursor.com/docs/cloud-agent.md](https://cursor.com/docs/cloud-agent.md)
- [https://cursor.com/docs/cloud-agent/capabilities.md](https://cursor.com/docs/cloud-agent/capabilities.md)
- Local: `fallow agent status --format json`, `fallow agent install --harness cursor --dry-run --format json` (fallow 3.22.0)
