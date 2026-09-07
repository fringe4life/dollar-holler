/**
 * Cursor-native Fallow gate. Claude's fallow-gate.sh is PreToolUse + jq;
 * Cursor uses beforeShellExecution (permission) and stop (followup_message).
 *
 * Fail-open on runtime errors. Deny / follow up only on audit verdict "fail".
 * VARLOCK_ENV=test must be set by the shell wrapper (bunfig preloads varlock).
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

const MIN_VERSION_DEFAULT = "2.85.0";
const MAX_AGENT_JSON_CHARS = 12_000;
/** Fallow: no error-severity issues. */
const FALLOW_EXIT_OK = 0;
/** Fallow: issues found (JSON still valid). */
const FALLOW_EXIT_ISSUES = 1;
/** Fallow: runtime / config / parse error. */
const FALLOW_EXIT_RUNTIME = 2;
const GIT_VALUE_OPTIONS = new Set([
  "-c",
  "-C",
  "--git-dir",
  "--work-tree",
  "--namespace",
  "--config-env",
  "--super-prefix",
  "--exec-path",
  "--list-cmds",
  "--attr-source",
]);

type HookEvent = "beforeShellExecution" | "stop";

type ShellHookInput = {
  command?: unknown;
};

type StopHookInput = {
  status?: unknown;
  loop_count?: unknown;
};

type AuditJson = {
  error?: unknown;
  verdict?: unknown;
  message?: unknown;
};

type AuditOutcome =
  | { status: "fail"; payload: unknown; version: string; bin: string }
  | { status: "pass" }
  | { status: "skip"; reason: string }
  | { status: "deny_version"; reason: string };

const isAuditJson = (value: unknown): value is AuditJson =>
  typeof value === "object" && value !== null;

const repoRoot = process.cwd();
const fallowBin = join(repoRoot, "node_modules/.bin/fallow");

const writeJson = (value: unknown): void => {
  process.stdout.write(`${JSON.stringify(value)}\n`);
};

const parseEvent = (): HookEvent | undefined => {
  const flagIndex = process.argv.indexOf("--event");
  const value = flagIndex === -1 ? undefined : process.argv[flagIndex + 1];
  if (value === "beforeShellExecution" || value === "stop") {
    return value;
  }
  return undefined;
};

const readStdinJson = (): unknown => {
  const raw = readFileSync(0, "utf8").trim();
  if (raw.length === 0) {
    return {};
  }
  return JSON.parse(raw) as unknown;
};

const isGitExecutable = (token: string): boolean => {
  const name = basename(token.replaceAll("\\", "/"));
  return name === "git" || name === "git.exe";
};

const isGitWriteCommand = (command: string): boolean => {
  const segments = command.split(/[;|&()]/);
  for (const segment of segments) {
    const tokens = segment.match(/\S+/g) ?? [];
    let index = 0;
    while (index < tokens.length) {
      const token = tokens[index];
      if (token === undefined || !isGitExecutable(token)) {
        index += 1;
        continue;
      }
      index += 1;
      while (index < tokens.length) {
        const gitArg = tokens[index];
        if (gitArg === undefined) {
          break;
        }
        if (gitArg === "commit" || gitArg === "push") {
          return true;
        }
        if (GIT_VALUE_OPTIONS.has(gitArg)) {
          index += 2;
          continue;
        }
        if (gitArg.startsWith("-")) {
          index += 1;
          continue;
        }
        break;
      }
    }
  }
  return false;
};

const parseSemver = (version: string): [number, number, number] => {
  const [major = 0, minor = 0, patch = 0] = version.split(".").map((part) => {
    const numeric = Number.parseInt(part, 10);
    return Number.isFinite(numeric) ? numeric : 0;
  });
  return [major, minor, patch];
};

const isBelowMinVersion = (version: string, minVersion: string): boolean => {
  const actual = parseSemver(version);
  const min = parseSemver(minVersion);
  for (let index = 0; index < 3; index += 1) {
    const actualPart = actual[index] ?? 0;
    const minPart = min[index] ?? 0;
    if (actualPart < minPart) {
      return true;
    }
    if (actualPart > minPart) {
      return false;
    }
  }
  return false;
};

const compactJson = (payload: unknown): string => {
  const text = JSON.stringify(payload, null, 2) ?? "null";
  if (text.length <= MAX_AGENT_JSON_CHARS) {
    return text;
  }
  return `${text.slice(0, MAX_AGENT_JSON_CHARS)}\n… truncated; rerun: fallow audit --format json --quiet --explain --gate-marker agent`;
};

const ensureStyledSystem = (): string | undefined => {
  if (existsSync(join(repoRoot, "styled-system"))) {
    return undefined;
  }
  const result = spawnSync("bun", ["run", "fallow:prepare"], {
    cwd: repoRoot,
    env: { ...process.env, VARLOCK_ENV: "test" },
    encoding: "utf8",
  });
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || "unknown error").trim();
    return `fallow:prepare failed (${detail.split("\n")[0] ?? "unknown error"})`;
  }
  return undefined;
};

const runAudit = (): AuditOutcome => {
  if (!existsSync(fallowBin)) {
    return {
      status: "skip",
      reason:
        "fallow-gate: fallow binary not found at node_modules/.bin/fallow, skipping audit.",
    };
  }

  const versionResult = spawnSync(fallowBin, ["--version"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  const versionRaw = (versionResult.stdout || "").trim();
  const version = versionRaw.replace(/^fallow\s+/, "").split(/\s+/)[0] ?? "";
  const minVersion = process.env.FALLOW_GATE_MIN_VERSION ?? MIN_VERSION_DEFAULT;
  if (
    minVersion.length > 0 &&
    version.length > 0 &&
    isBelowMinVersion(version, minVersion)
  ) {
    return {
      status: "deny_version",
      reason: `fallow-gate: ${fallowBin} is fallow ${version}, below required ${minVersion}. Upgrade fallow or set FALLOW_GATE_MIN_VERSION= to disable.`,
    };
  }

  const prepareError = ensureStyledSystem();
  if (prepareError !== undefined) {
    return {
      status: "skip",
      reason: `fallow-gate: ${prepareError}, skipping audit.`,
    };
  }

  const audit = spawnSync(
    fallowBin,
    [
      "audit",
      "--format",
      "json",
      "--quiet",
      "--explain",
      "--gate-marker",
      "agent",
    ],
    {
      cwd: repoRoot,
      encoding: "utf8",
      env: {
        ...process.env,
        FALLOW_AGENT_SOURCE: process.env.FALLOW_AGENT_SOURCE ?? "cursor",
      },
    }
  );

  let payload: unknown;
  try {
    payload = JSON.parse((audit.stdout || "").trim() || "{}") as unknown;
  } catch {
    return {
      status: "skip",
      reason: `fallow-gate: fallow audit exited ${String(audit.status)} with invalid JSON, skipping.`,
    };
  }

  if (!isAuditJson(payload)) {
    return {
      status: "skip",
      reason: "fallow-gate: fallow audit JSON was not an object, skipping.",
    };
  }

  const record = payload;
  if (record.verdict === "fail") {
    return {
      status: "fail",
      payload,
      version: version || "unknown",
      bin: fallowBin,
    };
  }

  if (audit.status === FALLOW_EXIT_RUNTIME || record.error === true) {
    const message =
      typeof record.message === "string" ? record.message : "runtime error";
    return {
      status: "skip",
      reason: `fallow-gate: fallow audit runtime error (${message}), skipping.`,
    };
  }

  if (audit.status !== FALLOW_EXIT_OK && audit.status !== FALLOW_EXIT_ISSUES) {
    const errLine = (audit.stderr || "").trim().split("\n")[0] ?? "";
    const detail = errLine.length > 0 ? ` (${errLine})` : "";
    return {
      status: "skip",
      reason: `fallow-gate: fallow audit exited ${String(audit.status)}${detail}, skipping.`,
    };
  }

  return { status: "pass" };
};

const handleShell = (input: ShellHookInput): void => {
  const command = typeof input.command === "string" ? input.command : "";
  if (!isGitWriteCommand(command)) {
    writeJson({ permission: "allow" });
    return;
  }

  const outcome = runAudit();
  if (outcome.status === "fail") {
    const body = compactJson(outcome.payload);
    process.stderr.write(
      `fallow-gate: blocked by fallow ${outcome.version} at ${outcome.bin}\n`
    );
    writeJson({
      permission: "deny",
      user_message: "Fallow audit blocked git commit/push (verdict: fail).",
      agent_message: `Fallow audit verdict is fail. Fix the findings before git commit/push.\n${body}`,
    });
    return;
  }

  if (outcome.status === "deny_version") {
    process.stderr.write(`${outcome.reason}\n`);
    writeJson({
      permission: "deny",
      user_message:
        "Fallow gate blocked: fallow binary is below the required version.",
      agent_message: outcome.reason,
    });
    return;
  }

  if (outcome.status === "skip") {
    process.stderr.write(`${outcome.reason}\n`);
  }
  writeJson({ permission: "allow" });
};

const handleStop = (input: StopHookInput): void => {
  if (input.status !== "completed") {
    writeJson({});
    return;
  }

  const outcome = runAudit();
  if (outcome.status === "fail") {
    const body = compactJson(outcome.payload);
    writeJson({
      followup_message: `Fallow audit verdict is fail. Do not finish until it passes. Fix the findings, then stop again.\n${body}`,
    });
    return;
  }

  if (outcome.status === "deny_version") {
    writeJson({
      followup_message: `${outcome.reason} Do not finish until fallow meets the version floor.`,
    });
    return;
  }

  if (outcome.status === "skip") {
    process.stderr.write(`${outcome.reason}\n`);
  }
  writeJson({});
};

const event = parseEvent();
if (event === undefined) {
  process.stderr.write(
    "fallow-gate: missing --event beforeShellExecution|stop, skipping.\n"
  );
  writeJson({});
  process.exit(0);
}

try {
  const input = readStdinJson();
  if (event === "beforeShellExecution") {
    handleShell(input as ShellHookInput);
  } else {
    handleStop(input as StopHookInput);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : "unknown error";
  process.stderr.write(`fallow-gate: ${message}, skipping.\n`);
  if (event === "beforeShellExecution") {
    writeJson({ permission: "allow" });
  } else {
    writeJson({});
  }
}
