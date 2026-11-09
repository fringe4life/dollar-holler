/**
 * Local `alchemy dev` so Vite SSR gets Cloudflare bindings.
 *
 * Exact command:
 *   bun run panda:build && varlock run -- bun x alchemy dev --stage dev
 *
 * `bun vite dev` alone is Node SSR with no Worker env. This wrapper is
 * `bun run dev` after `panda:build`.
 *
 * D1 stays on Alchemy's local provider (`.alchemy/local/d1`). Live
 * `dolla-holla` adopt is `bun run deploy -- --adopt`, not `alchemy dev`.
 * No custom domain.
 *
 * If Cloudflare credentials are missing, a gitignored local-only profile
 * is written under `.alchemy/home` so local providers can start. That is
 * not a deploy login.
 */
import { spawnSync } from "node:child_process";
import { LIVE_PRODUCTION_D1_UUID } from "../alchemy.run.ts";
import { ensureLocalAlchemyProfile } from "./alchemy-d1.ts";

export const ALCHEMY_DEV_COMMAND =
  "bun run panda:build && varlock run -- bun x alchemy dev --stage dev";

if (process.env.__VARLOCK_RUN !== "1") {
  console.error(
    `bun run dev requires \`varlock run\` so alchemy.run.ts Config sees the schema (__VARLOCK_RUN is unset).\nRun: ${ALCHEMY_DEV_COMMAND}`
  );
  process.exit(1);
}

const remoteId = process.env.CLOUDFLARE_D1_DATABASE_ID?.trim() ?? "";
if (remoteId === LIVE_PRODUCTION_D1_UUID) {
  console.warn(
    "CLOUDFLARE_D1_DATABASE_ID is LIVE_PRODUCTION_D1_UUID (dolla-holla). Local alchemy dev ignores it and uses `.alchemy/local/d1`."
  );
}

ensureLocalAlchemyProfile();
if (process.env.ALCHEMY_HOME?.endsWith(".alchemy/home") === true) {
  console.warn(
    "No Cloudflare credentials. Using a local-only Alchemy profile under .alchemy/home. D1 stays on the local provider. If alchemy still asks for login, run that login, then:\n" +
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
    `alchemy dev failed (exit ${String(result.status)}).\nExact command: ${ALCHEMY_DEV_COMMAND}\nLocal D1 persist is .alchemy/local/d1. This is not a live apply.`
  );
}

process.exit(result.status ?? 1);
