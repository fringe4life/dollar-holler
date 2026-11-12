/**
 * Live Alchemy deploy with Worker secrets from Varlock, Cloudflare
 * auth from `alchemy profile`.
 *
 * `varlock run` would inject `CLOUDFLARE_API_TOKEN` (D1 edit only).
 * Alchemy prefers that env over the CLI profile, so Website reconcile
 * 403s. This wrapper keeps schema secrets and drops the D1 HTTP keys.
 * No `--adopt`. Run after `alchemy profile`.
 *
 * Exact command: `varlock run -- bun ./scripts/alchemy-deploy.ts`
 */
import { spawnSync } from "node:child_process";
import {
  alchemyDeployArgvRefusesAdopt,
  alchemyProfileOnlyEnv,
} from "./alchemy-d1.ts";

const ALCHEMY_DEPLOY_COMMAND = "varlock run -- bun ./scripts/alchemy-deploy.ts";

if (alchemyDeployArgvRefusesAdopt(process.argv.slice(2))) {
  console.error(
    "alchemy:deploy refuses adopt. Run `bun run alchemy:deploy` after `alchemy profile`. D1 HTTP keys stay on db:seed:remote."
  );
  process.exit(1);
}

if (process.env.__VARLOCK_RUN !== "1") {
  console.error(
    `bun run alchemy:deploy requires \`varlock run\` so alchemy.run.ts Config sees the schema (__VARLOCK_RUN is unset).\nRun: ${ALCHEMY_DEPLOY_COMMAND}`
  );
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  ["x", "alchemy", "deploy", "--stage", "dev"],
  { env: alchemyProfileOnlyEnv(), stdio: "inherit" }
);

if (result.error) {
  console.error(result.error.message);
  console.error(`Exact command: ${ALCHEMY_DEPLOY_COMMAND}`);
  process.exit(1);
}

if (result.signal !== null && result.signal !== undefined) {
  console.error(
    `alchemy deploy terminated by signal ${result.signal}.\nExact command: ${ALCHEMY_DEPLOY_COMMAND}`
  );
  process.exit(1);
}

if (result.status !== 0) {
  console.error(
    `alchemy deploy failed (exit ${String(result.status)}).\nExact command: ${ALCHEMY_DEPLOY_COMMAND}\nCloudflare auth is the Alchemy CLI profile, not CLOUDFLARE_API_TOKEN.`
  );
}

process.exit(result.status ?? 1);
