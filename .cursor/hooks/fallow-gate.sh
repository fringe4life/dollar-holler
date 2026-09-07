#!/usr/bin/env bash
# Cursor hook wrapper. bunfig preloads varlock, so pin VARLOCK_ENV before bun starts.
set -euo pipefail
export VARLOCK_ENV="${VARLOCK_ENV:-test}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
exec bun "$ROOT/.cursor/hooks/fallow-gate.ts" "$@"
