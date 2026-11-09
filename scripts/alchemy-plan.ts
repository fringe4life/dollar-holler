/**
 * Local dry-run of `alchemy.run.ts`.
 *
 * Requires `varlock run` (`__VARLOCK_RUN=1`) so Effect `Config` reads the
 * resolved schema, not an empty process. Does not call `Alchemist.apply`.
 * A Cloudflare HTTP request aborts the process.
 *
 * Run: `bun run alchemy:plan`
 * (`VARLOCK_ENV=test bun x varlock run -- bun ./scripts/alchemy-plan.ts`).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as Alchemist from "alchemy/Alchemist";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Redacted from "effect/Redacted";

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

if (process.env.__VARLOCK_RUN !== "1") {
  console.error(
    "alchemy:plan requires `varlock run` so Config reads the resolved schema (__VARLOCK_RUN is unset). Bun's varlock preload is not the deploy injection."
  );
  process.exit(1);
}

const formatConfig = (value: unknown): string => {
  if (Redacted.isRedacted(value)) return "Redacted";
  if (Option.isOption(value)) {
    return Option.match(value, {
      onNone: () => "absent",
      onSome: (inner) => formatConfig(inner),
    });
  }
  if (typeof value === "string") return value;
  return "non-plain";
};

const resolvedEnv = await Effect.runPromise(
  Effect.all({
    PUBLIC_BASE_URL: Config.String("PUBLIC_BASE_URL"),
    ORIGIN: Config.String("ORIGIN"),
    VARLOCK_ENV: Config.String("VARLOCK_ENV"),
    BETTER_AUTH_SECRET: Config.Redacted("BETTER_AUTH_SECRET"),
    OGYGIA_SECRET: Config.Redacted("OGYGIA_SECRET"),
    SENTRY_AUTH_TOKEN: Config.Redacted("SENTRY_AUTH_TOKEN"),
  })
);

console.log("varlock Config:");
for (const [key, value] of Object.entries(resolvedEnv)) {
  console.log(`  ${key}=${formatConfig(value)}`);
}
if (resolvedEnv.PUBLIC_BASE_URL !== "http://localhost:5173") {
  console.error(
    `expected PUBLIC_BASE_URL from .env.test, got ${resolvedEnv.PUBLIC_BASE_URL}`
  );
  process.exit(1);
}
if (resolvedEnv.VARLOCK_ENV !== "test") {
  console.error(`expected VARLOCK_ENV=test, got ${resolvedEnv.VARLOCK_ENV}`);
  process.exit(1);
}

// Alchemy's provider layer wants a Cloudflare profile when the schema token
// is blank. Keep that profile off process.env so Config still sees Varlock.
const alchemyHome = join(tmpdir(), "dollar-holler-alchemy-plan");
process.env.ALCHEMY_HOME = alchemyHome;
const profileDir = join(alchemyHome, "profiles", "default");
mkdirSync(profileDir, { recursive: true });
writeFileSync(
  join(profileDir, "cloudflare.json"),
  JSON.stringify(
    {
      format: "alchemy.profile/v1",
      provider: "Cloudflare",
      metadata: {},
      values: {
        method: "stored",
        credentialType: "apiToken",
        apiToken: "offline-plan-not-a-credential",
        accountId: "00000000000000000000000000000000",
      },
    },
    null,
    2
  )
);

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

const nativeResources = Object.values(planned.native.resources) as Array<{
  props?: { env?: Record<string, unknown> };
}>;
for (const resource of nativeResources) {
  const env = resource.props?.env;
  if (env === undefined) continue;
  console.log("planned Worker env:");
  for (const [key, value] of Object.entries(env)) {
    if (key === "DB") {
      console.log("  DB=D1 binding");
      continue;
    }
    console.log(`  ${key}=${formatConfig(value)}`);
  }
}

const { summary } = planned;
console.log(
  `Plan: ${summary.create} to create, ${summary.update} to update, ${summary.replace} to replace, ${summary.delete} to delete, ${summary.noop} unchanged. Nothing applied.`
);
