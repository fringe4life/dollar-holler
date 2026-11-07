/**
 * Apply flattened D1 SQL through Alchemy.
 *
 * Local: `Cloudflare.D1.Database` `migrations:` on the local simulator
 * (`.alchemy/local/d1`). Same persist `alchemy dev` binds. Not a live apply.
 * Remote: D1 HTTP API + Alchemy `__alchemy_migrations` bookkeeping.
 */
import {
  applyLocalAlchemyD1Migrations,
  applyRemoteAlchemyD1Migrations,
} from "./alchemy-d1.ts";

const remote = process.argv.includes("--remote");

try {
  if (remote) {
    await applyRemoteAlchemyD1Migrations();
  } else {
    await applyLocalAlchemyD1Migrations();
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
