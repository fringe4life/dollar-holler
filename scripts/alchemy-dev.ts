/**
 * Local `alchemy dev` so Vite SSR gets Cloudflare bindings.
 *
 * Exact command:
 *   bun run panda:build && varlock run -- bun x alchemy dev --stage dev
 *
 * `bun vite dev` alone is Node SSR with no Worker env. This wrapper is
 * `bun run dev` after `panda:build`.
 *
 * D1 stays on Alchemy's local provider (`.alchemy/local`) plus Miniflare
 * persist (`.wrangler/state`). Production D1
 * `08d44dec-3fb0-4ddc-bd6e-9d0b8aa8a185` is refused.
 *
 * If Cloudflare credentials are missing, a gitignored local-only profile
 * is written under `.alchemy/home` so local providers can start. That is
 * not a deploy login.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { LIVE_D1_DATABASE_ID } from "../alchemy.run.ts";

export const ALCHEMY_DEV_COMMAND =
  "bun run panda:build && varlock run -- bun x alchemy dev --stage dev";

if (process.env.__VARLOCK_RUN !== "1") {
  console.error(
    `bun run dev requires \`varlock run\` so alchemy.run.ts Config sees the schema (__VARLOCK_RUN is unset).\nRun: ${ALCHEMY_DEV_COMMAND}`
  );
  process.exit(1);
}

const remoteId = process.env.CLOUDFLARE_D1_DATABASE_ID?.trim() ?? "";
if (remoteId === LIVE_D1_DATABASE_ID) {
  console.warn(
    "CLOUDFLARE_D1_DATABASE_ID is the live dollar-holler database. Local alchemy dev ignores it and uses spike D1 persist (.alchemy/local)."
  );
}

const token = process.env.CLOUDFLARE_API_TOKEN?.trim() ?? "";
const defaultProfile = join(
  homedir(),
  ".alchemy",
  "profiles",
  "default",
  "cloudflare.json"
);
if (
  token.length === 0 &&
  !existsSync(defaultProfile) &&
  (process.env.ALCHEMY_HOME === undefined || process.env.ALCHEMY_HOME === "")
) {
  const alchemyHome = join(process.cwd(), ".alchemy", "home");
  const profileDir = join(alchemyHome, "profiles", "default");
  mkdirSync(profileDir, { recursive: true });
  writeFileSync(
    join(profileDir, "cloudflare.json"),
    `${JSON.stringify(
      {
        format: "alchemy.profile/v1",
        provider: "Cloudflare",
        metadata: {},
        values: {
          method: "stored",
          credentialType: "apiToken",
          apiToken: "local-dev-not-a-credential",
          accountId: "00000000000000000000000000000000",
        },
      },
      null,
      2
    )}\n`
  );
  process.env.ALCHEMY_HOME = alchemyHome;
  console.warn(
    "No Cloudflare credentials. Using a local-only Alchemy profile under .alchemy/home. D1 stays on the local provider (not production). If alchemy still asks for login, run that login, then:\n" +
      `  ${ALCHEMY_DEV_COMMAND}`
  );
}

const result = spawnSync(
  process.execPath,
  ["x", "alchemy", "dev", "--stage", "dev"],
  { env: process.env, stdio: "inherit" }
);

if (result.error) {
  console.error(result.error.message);
  console.error(`Exact command: ${ALCHEMY_DEV_COMMAND}`);
  process.exit(1);
}

if (result.status !== 0) {
  console.error(
    `alchemy dev failed (exit ${String(result.status)}).\nExact command: ${ALCHEMY_DEV_COMMAND}\nLocal D1 persist is .alchemy/local and .wrangler/state. It never uses production D1 ${LIVE_D1_DATABASE_ID}.`
  );
}

process.exit(result.status ?? 1);
