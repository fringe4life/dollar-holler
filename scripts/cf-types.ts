/**
 * Generate Worker `Env` types without a committed Wrangler config.
 * Writes `.wrangler/d1.json` from `alchemy.run.ts`, then `wrangler types`.
 */
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { writeEphemeralWranglerConfig } from "./d1-wrangler-config.ts";

const configPath = await writeEphemeralWranglerConfig({ remote: false });
const result = spawnSync(
  join(process.cwd(), "node_modules/.bin/wrangler"),
  [
    "--config",
    configPath,
    "types",
    "./src/worker-configuration.d.ts",
    "--include-runtime",
    "false",
  ],
  { stdio: "inherit" }
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
