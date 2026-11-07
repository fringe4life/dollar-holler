/**
 * Wrangler still requires a config file for `d1 migrations apply` and
 * `getPlatformProxy`. This writes that file under `.wrangler` (gitignored).
 * Nothing here is committed. The compatibility date and database name come
 * from `alchemy.run.ts`.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  COMPATIBILITY_DATE,
  D1_MIGRATIONS_DIR,
  LIVE_D1_DATABASE_ID,
  SPIKE_NAME,
} from "../alchemy.run.ts";

const LOCAL_PLACEHOLDER_ID = "00000000-0000-0000-0000-000000000002";

/** Miniflare persist for local D1 (`db:migrate`, seed). */
export const LOCAL_D1_PERSIST_DIR = join(process.cwd(), ".wrangler", "state");

const ephemeralConfigPath = join(process.cwd(), ".wrangler", "d1.json");

export const writeEphemeralWranglerConfig = async (options: {
  remote: boolean;
}): Promise<string> => {
  const fromEnv = process.env.CLOUDFLARE_D1_DATABASE_ID?.trim() ?? "";
  const databaseId = options.remote ? fromEnv : LOCAL_PLACEHOLDER_ID;
  if (options.remote && databaseId.length === 0) {
    throw new Error(
      "db:migrate:remote needs CLOUDFLARE_D1_DATABASE_ID from Varlock. No database id is committed."
    );
  }
  if (databaseId === LIVE_D1_DATABASE_ID) {
    throw new Error(
      "Refusing D1 id of live database dollar-holler. Alchemy does not adopt it."
    );
  }

  const dir = join(process.cwd(), ".wrangler");
  await mkdir(dir, { recursive: true });
  const stubMain = join(dir, "d1-stub.js");
  await writeFile(
    stubMain,
    "export default { fetch() { return new Response(''); } };\n"
  );
  await writeFile(
    ephemeralConfigPath,
    `${JSON.stringify(
      {
        name: SPIKE_NAME,
        compatibility_date: COMPATIBILITY_DATE,
        main: "./d1-stub.js",
        d1_databases: [
          {
            binding: "DB",
            database_name: SPIKE_NAME,
            database_id: databaseId,
            migrations_dir: resolve(D1_MIGRATIONS_DIR),
          },
        ],
      },
      null,
      2
    )}\n`
  );
  return ephemeralConfigPath;
};
