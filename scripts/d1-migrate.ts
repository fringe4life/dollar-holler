/**
 * Apply flattened D1 SQL with the Wrangler CLI.
 * `wrangler d1 migrations apply` refuses to run without a config file, so
 * this writes `.wrangler/d1.json` from `alchemy.run.ts` and passes `--config`.
 * That file is gitignored. Alchemy deploy applies the same directory via
 * `Cloudflare.D1.Database` `migrations`.
 */
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { writeEphemeralWranglerConfig } from "./d1-wrangler-config.ts";
import { SPIKE_NAME } from "../alchemy.run.ts";

const remote = process.argv.includes("--remote");
const configPath = await writeEphemeralWranglerConfig({ remote });
const result = spawnSync(
  join(process.cwd(), "node_modules/.bin/wrangler"),
  [
    "--config",
    configPath,
    "d1",
    "migrations",
    "apply",
    SPIKE_NAME,
    remote ? "--remote" : "--local",
    ...(remote ? [] : ["--persist-to", join(process.cwd(), ".wrangler/state")]),
  ],
  { stdio: "inherit" }
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
