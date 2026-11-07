/**
 * Offline dry-run of `alchemy.run.ts`.
 *
 * `alchemy plan` is not used. `Cloudflare.state()` can deploy the account
 * Worker `alchemy-state-store` while loading state, so `alchemy.run.ts`
 * uses `Alchemy.localState()` instead. This script plans with `dev: true`
 * (local providers) and never calls `Alchemist.apply`. A Cloudflare HTTP
 * request aborts the process.
 *
 * Run: `bun run alchemy:plan` (`VARLOCK_ENV=test`).
 */
import * as Alchemist from "alchemy/Alchemist";
import * as Effect from "effect/Effect";

const STAGE = "dev";

const refused = process.argv
  .slice(2)
  .filter(
    (arg) =>
      arg === "deploy" ||
      arg === "apply" ||
      arg === "destroy" ||
      arg === "--yes" ||
      arg === "--adopt"
  );

if (refused.length > 0) {
  console.error(
    `alchemy:plan refuses to apply changes (got ${refused.join(" ")}).`
  );
  process.exit(1);
}

// A configured Alchemy profile or a real API token would let provider
// startup talk to Cloudflare. Refuse those, then install a non-routable
// account id so `Cloudflare.providers()` can build in local mode.
const liveToken = process.env.CLOUDFLARE_API_TOKEN?.trim() ?? "";
if (liveToken.length > 0) {
  console.error(
    "alchemy:plan refuses to run with CLOUDFLARE_API_TOKEN set. Unset it; this script does not call Cloudflare."
  );
  process.exit(1);
}
delete process.env.CLOUDFLARE_API_KEY;
process.env.CLOUDFLARE_ACCOUNT_ID = "00000000000000000000000000000000";
process.env.CLOUDFLARE_API_TOKEN = "offline-plan-not-a-credential";

const fetchImpl = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;
  if (
    url.includes("cloudflare.com") ||
    url.includes("workers.dev") ||
    url.includes("cloudflarestorage.com")
  ) {
    console.error(`alchemy:plan blocked a Cloudflare request: ${url}`);
    process.exit(1);
  }
  return fetchImpl(input, init);
}) as typeof fetch;

const stack = (await import("../alchemy.run.ts")).default;

const planned = await Effect.runPromise(
  Alchemist.plan({
    stack,
    stage: STAGE,
    operation: "deploy",
    dev: true,
    adopt: false,
    updateStateStore: false,
  }).pipe(Effect.provide(Alchemist.layer()), Effect.scoped)
);

const live = planned.resources.filter(
  (resource) => resource.providerMode === "live"
);
if (live.length > 0) {
  console.error(
    `alchemy:plan refused a live provider: ${live
      .map((resource) => resource.logicalId)
      .join(", ")}`
  );
  process.exit(1);
}

const adopted = planned.resources.filter(
  (resource) => resource.action === "adopted"
);
if (adopted.length > 0) {
  console.error(
    `alchemy:plan refused adoption: ${adopted
      .map((resource) => resource.logicalId)
      .join(", ")}`
  );
  process.exit(1);
}

console.log(
  `stage=${planned.stack.stage} dev=true state=local adopt=false apply=never`
);
for (const resource of planned.resources) {
  console.log(
    `${resource.action} ${resource.resourceType} ${resource.logicalId} mode=${resource.providerMode ?? "n/a"}`
  );
}
const { summary } = planned;
console.log(
  `Plan: ${summary.create} to create, ${summary.update} to update, ${summary.replace} to replace, ${summary.delete} to delete, ${summary.noop} unchanged. Nothing applied.`
);
