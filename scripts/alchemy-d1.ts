/**
 * Local and remote D1 access that Alchemy owns.
 *
 * Local persist is `.alchemy/local/d1` (the same simulator `alchemy dev`
 * binds). Remote uses the Cloudflare D1 HTTP API against
 * `CLOUDFLARE_D1_DATABASE_ID`, and refuses live UUID
 * `LIVE_PRODUCTION_D1_UUID` (`08d44dec-3fb0-4ddc-bd6e-9d0b8aa8a185`)
 * (`db:seed:remote` / `db:migrate:remote` exit 1). Alchemy declares one
 * D1 named `dolla-holla` and does not adopt that UUID.
 */
import { D1 } from "@alchemy.run/cloudflare-runtime/core/bindings";
import { getPlatformProxy } from "@alchemy.run/cloudflare-runtime/core/platform-proxy";
import {
  inlineSqlParams,
  MigrationError,
  runMigrations,
  type SqlExecutor,
} from "@alchemy.run/sql/Migrations";
import type {
  D1Database,
  D1ExecResult,
  D1PreparedStatement,
  D1Result,
} from "@cloudflare/workers-types";
import { layer as BunServices } from "@effect/platform-bun/BunServices";
import * as Alchemist from "alchemy/Alchemist";
import * as Effect from "effect/Effect";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { ENV } from "varlock/env";
import {
  APP_NAME,
  D1_MIGRATIONS_DIR,
  LIVE_PRODUCTION_D1_UUID,
} from "../alchemy.run.ts";

const ALCHEMY_STAGE = "dev";
export const ALCHEMY_LOCAL_PERSIST_DIR = join(
  process.cwd(),
  ".alchemy",
  "local"
);

export const alchemyDatabaseStatePath = (stage = ALCHEMY_STAGE): string =>
  join(process.cwd(), ".alchemy", "state", APP_NAME, stage, "Database.json");

/** Local simulator rows are `dev:` ids. The existing live UUID is never a local persist key. */
export const assertLocalSimulatorD1Id = (databaseId: string): void => {
  if (
    databaseId === LIVE_PRODUCTION_D1_UUID ||
    !databaseId.startsWith("dev:")
  ) {
    throw new Error(
      `Local D1 must be the Alchemy simulator (dev: id under .alchemy/local/d1), not ${databaseId}.`
    );
  }
};

/** Remote CLI must not hit the pre-Alchemy live UUID. No override flag. */
export const assertRemoteD1DatabaseId = (databaseId: string): void => {
  if (databaseId === LIVE_PRODUCTION_D1_UUID) {
    throw new Error(
      "Refusing D1 id of leftover database 08d44dec (LIVE_PRODUCTION_D1_UUID). Alchemy does not adopt it. Point CLOUDFLARE_D1_DATABASE_ID at the Alchemy-managed D1 named dolla-holla."
    );
  }
};

/**
 * D1 HTTP CLI keys (Varlock / Bitwarden). Alchemy treats
 * `CLOUDFLARE_API_TOKEN` as deploy credentials and then ignores
 * `alchemy profile`. The D1-edit token is not a Workers token.
 */
const ALCHEMY_D1_HTTP_ENV_KEYS = [
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_ACCOUNT_ID",
  "CLOUDFLARE_D1_DATABASE_ID",
] as const;

/** Copy env without D1 HTTP keys so Alchemy uses the CLI profile. */
export const alchemyProfileOnlyEnv = (
  env: NodeJS.ProcessEnv = process.env
): NodeJS.ProcessEnv => {
  const next = { ...env };
  for (const key of ALCHEMY_D1_HTTP_ENV_KEYS) {
    delete next[key];
  }
  return next;
};

export const alchemyDeployArgvRefusesAdopt = (argv: string[]): boolean =>
  argv.some((arg) => arg === "--adopt" || arg === "adopt");

/** Dummy Cloudflare profile so local providers start without a deploy login. */
export const ensureLocalAlchemyProfile = (): void => {
  const token = process.env.CLOUDFLARE_API_TOKEN?.trim() ?? "";
  const defaultProfile = join(
    homedir(),
    ".alchemy",
    "profiles",
    "default",
    "cloudflare.json"
  );
  if (
    token.length > 0 ||
    existsSync(defaultProfile) ||
    (process.env.ALCHEMY_HOME !== undefined && process.env.ALCHEMY_HOME !== "")
  ) {
    return;
  }
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
};

type AlchemyDatabaseState = {
  attr?: { databaseId?: string };
  providerMode?: string;
};

const readLocalAlchemyDatabaseId = (stage = ALCHEMY_STAGE): string => {
  const path = alchemyDatabaseStatePath(stage);
  if (!existsSync(path)) {
    throw new Error(
      `No Alchemy local D1 state at ${path}. Run bun run db:migrate first so Cloudflare.D1.Database reconciles under .alchemy/local.`
    );
  }
  const row = JSON.parse(readFileSync(path, "utf8")) as AlchemyDatabaseState;
  const databaseId = row.attr?.databaseId?.trim() ?? "";
  if (databaseId.length === 0) {
    throw new Error(`Alchemy Database state at ${path} has no databaseId.`);
  }
  assertLocalSimulatorD1Id(databaseId);
  return databaseId;
};

const openLocalAlchemyD1 = async () => {
  const databaseId = readLocalAlchemyDatabaseId();
  console.log(
    `Opening Alchemy local D1 ${databaseId} (persist ${ALCHEMY_LOCAL_PERSIST_DIR}/d1)`
  );
  return getPlatformProxy<{ DB: D1Database }>({
    name: "dollar-holler-d1",
    persist: { directory: ALCHEMY_LOCAL_PERSIST_DIR },
    bindings: [D1.local({ binding: "DB", id: databaseId })],
  });
};

export type RemoteD1Credentials = {
  accountId: string;
  databaseId: string;
  apiToken: string;
};

const schemaEnvString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

/** Remote D1 HTTP creds from Varlock schema keys (Bitwarden). No UUID in git.
 * `db:*:remote` sets CLOUDFLARE_D1_HTTP so schema `@required=eq` runs first. */
export const parseRemoteD1Credentials = (source: {
  accountId: string;
  databaseId: string;
  apiToken: string;
}): RemoteD1Credentials => {
  const accountId = source.accountId.trim();
  const databaseId = source.databaseId.trim();
  const apiToken = source.apiToken.trim();
  const missing = [
    accountId.length === 0 ? "CLOUDFLARE_ACCOUNT_ID" : undefined,
    databaseId.length === 0 ? "CLOUDFLARE_D1_DATABASE_ID" : undefined,
    apiToken.length === 0 ? "CLOUDFLARE_API_TOKEN" : undefined,
  ].filter((key): key is string => key !== undefined);
  if (missing.length > 0) {
    throw new Error(
      `Remote D1 needs ${missing.join(", ")} from the Varlock schema (Bitwarden or documented @required items). Update schema key CLOUDFLARE_D1_DATABASE_ID / Bitwarden secret f31e55fa-53d9-4232-a66f-b4a6002e5581 to the Alchemy D1 named dolla-holla. Set CLOUDFLARE_API_TOKEN=bitwarden("<item-uuid>") after creating that secret. No database id is committed. Never leftover UUID 08d44dec-3fb0-4ddc-bd6e-9d0b8aa8a185.`
    );
  }
  assertRemoteD1DatabaseId(databaseId);
  return { accountId, databaseId, apiToken };
};

type D1HttpQueryBody =
  | { sql: string; params?: unknown[] }
  | { batch: Array<{ sql: string; params?: unknown[] }> };

type D1HttpEnvelope = {
  success?: boolean;
  errors?: Array<{ message?: string }>;
  result?: Array<{
    results?: unknown;
    success?: boolean | null;
    meta?: unknown;
    error?: string;
  }>;
};

type D1HttpRawPacked = { columns: string[]; rows: unknown[][] };

/** Cloudflare `/query` and `/raw` take `{ sql }` or `{ batch: [...] }`, never a bare array. */
export const serializeD1HttpQueryBody = (body: D1HttpQueryBody): string =>
  JSON.stringify(body);

/** `/raw` returns `{ columns, rows }`. Object-row fallback keeps column order from the first row. */
export const parseD1RawResults = (results: unknown): D1HttpRawPacked => {
  if (
    results !== null &&
    typeof results === "object" &&
    "rows" in results &&
    Array.isArray((results as { rows?: unknown }).rows)
  ) {
    const packed = results as { columns?: unknown; rows: unknown[] };
    return {
      columns: Array.isArray(packed.columns) ? packed.columns.map(String) : [],
      rows: packed.rows as unknown[][],
    };
  }
  if (!Array.isArray(results)) {
    return { columns: [], rows: [] };
  }
  const objects = results as Record<string, unknown>[];
  const columns = objects[0] === undefined ? [] : Object.keys(objects[0]);
  return {
    columns,
    rows: objects.map((row) => columns.map((column) => row[column])),
  };
};

export const migrationSqlStatements = (
  statements: readonly string[]
): string[] =>
  statements
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0)
    .map((statement) =>
      statement.endsWith(";") ? statement : `${statement};`
    );

const normalizeBind = (value: unknown): unknown => {
  if (typeof value === "boolean") return value ? 1 : 0;
  if (value instanceof ArrayBuffer) {
    return Array.from(new Uint8Array(value));
  }
  if (ArrayBuffer.isView(value)) {
    return Array.from(
      new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
    );
  }
  return value;
};

const toResult = <T>(
  row:
    | {
        results?: unknown;
        success?: boolean | null;
        meta?: unknown;
      }
    | undefined
): D1Result<T> =>
  ({
    results: (row?.results ?? []) as T[],
    success: row?.success ?? true,
    meta: (row?.meta ?? {}) as D1Result<T>["meta"],
  }) as D1Result<T>;

const queryRemoteD1Http = async (
  credentials: RemoteD1Credentials,
  body: D1HttpQueryBody,
  endpoint: "query" | "raw" = "query"
): Promise<{
  result: Array<{
    results?: unknown;
    success?: boolean | null;
    meta?: unknown;
  }>;
}> => {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${credentials.accountId}/d1/database/${credentials.databaseId}/${endpoint}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credentials.apiToken}`,
        "Content-Type": "application/json",
      },
      body: serializeD1HttpQueryBody(body),
    }
  );
  const payload = (await response.json()) as D1HttpEnvelope;
  if (!response.ok || payload.success === false) {
    const detail =
      payload.errors
        ?.map((error) => error.message)
        .filter(Boolean)
        .join("; ") ?? response.statusText;
    throw new Error(
      `D1 HTTP query failed (${String(response.status)}): ${detail}`
    );
  }
  const result = payload.result ?? [];
  const failed = result.find((row) => row.success === false);
  if (failed) {
    throw new Error(failed.error ?? "D1 HTTP statement failed");
  }
  return { result };
};

type HttpPreparedStatement = D1PreparedStatement & {
  __query: string;
  __params: ReadonlyArray<unknown>;
};

const makeHttpD1Database = (credentials: RemoteD1Credentials): D1Database => {
  const makeStatement = (
    query: string,
    binds: ReadonlyArray<unknown>
  ): HttpPreparedStatement => {
    const exec = async () => {
      const res = await queryRemoteD1Http(credentials, {
        sql: query,
        params: binds.length ? binds.map(normalizeBind) : undefined,
      });
      return res.result[0];
    };
    return {
      bind: (...values: unknown[]) => makeStatement(query, values),
      first: (async (column?: string) => {
        const first = (
          (await exec())?.results as Record<string, unknown>[] | undefined
        )?.[0];
        if (first == null) return null;
        return column === undefined ? first : (first[column] ?? null);
      }) as D1PreparedStatement["first"],
      all: (async () => toResult(await exec())) as D1PreparedStatement["all"],
      run: (async () => toResult(await exec())) as D1PreparedStatement["run"],
      raw: (async (options?: { columnNames?: boolean }) => {
        const res = await queryRemoteD1Http(
          credentials,
          {
            sql: query,
            params: binds.length ? binds.map(normalizeBind) : undefined,
          },
          "raw"
        );
        const packed = parseD1RawResults(res.result[0]?.results);
        if (options?.columnNames === true) {
          return [packed.columns, ...packed.rows];
        }
        return packed.rows;
      }) as D1PreparedStatement["raw"],
      __query: query,
      __params: binds,
    } as HttpPreparedStatement;
  };

  return {
    prepare: (query: string) => makeStatement(query, []),
    exec: async (query: string): Promise<D1ExecResult> => {
      const res = await queryRemoteD1Http(credentials, { sql: query });
      const meta = res.result[res.result.length - 1]?.meta as
        { duration?: number } | undefined;
      return { count: res.result.length, duration: meta?.duration ?? 0 };
    },
    batch: async <T = unknown>(statements: D1PreparedStatement[]) => {
      const res = await queryRemoteD1Http(credentials, {
        batch: statements.map((statement) => {
          const prepared = statement as HttpPreparedStatement;
          return {
            sql: prepared.__query,
            params: prepared.__params.length
              ? prepared.__params.map(normalizeBind)
              : undefined,
          };
        }),
      });
      return res.result.map((row) => toResult<T>(row));
    },
  } as unknown as D1Database;
};

const requireVarlock = (command: string): void => {
  if (process.env.__VARLOCK_RUN !== "1") {
    throw new Error(
      `${command} requires \`varlock run\` so alchemy.run.ts Config sees the schema (__VARLOCK_RUN is unset).`
    );
  }
};

const readRemoteD1Credentials = (): RemoteD1Credentials =>
  parseRemoteD1Credentials({
    accountId:
      schemaEnvString(ENV.CLOUDFLARE_ACCOUNT_ID) ||
      (process.env.CLOUDFLARE_ACCOUNT_ID?.trim() ?? ""),
    databaseId:
      schemaEnvString(ENV.CLOUDFLARE_D1_DATABASE_ID) ||
      (process.env.CLOUDFLARE_D1_DATABASE_ID?.trim() ?? ""),
    apiToken:
      schemaEnvString(ENV.CLOUDFLARE_API_TOKEN) ||
      (process.env.CLOUDFLARE_API_TOKEN?.trim() ?? ""),
  });

const openRemoteAlchemyD1 = (): {
  env: { DB: D1Database };
  dispose: () => Promise<void>;
} => {
  requireVarlock("db:seed:remote");
  const credentials = readRemoteD1Credentials();
  console.warn(
    `Opening remote D1 ${credentials.databaseId} over Cloudflare HTTP. Refuses LIVE_PRODUCTION_D1_UUID. Alchemy D1 name is dolla-holla (no adopt).`
  );
  return {
    env: { DB: makeHttpD1Database(credentials) },
    dispose: async () => undefined,
  };
};

export const openAlchemyD1 = async (remote = false) =>
  remote ? openRemoteAlchemyD1() : openLocalAlchemyD1();

const migrationEffect = <A>(
  message: string,
  run: () => Promise<A>
): Effect.Effect<A, MigrationError> =>
  Effect.tryPromise({
    try: run,
    catch: (cause) =>
      new MigrationError({
        message: `${message}: ${String(cause)}`,
        cause,
      }),
  });

const makeSqlExecutor = (driver: {
  query: (
    sql: string,
    params?: readonly unknown[]
  ) => Promise<Array<Record<string, unknown>>>;
  batch: (statements: string[]) => Promise<void>;
}): SqlExecutor => ({
  dialect: "sqlite",
  query: (sql, params) =>
    migrationEffect("D1 query failed", () => driver.query(sql, params)),
  batch: (statements) =>
    migrationEffect("D1 migration batch failed", () =>
      driver.batch(migrationSqlStatements(statements))
    ),
});

const makeHttpMigrationExecutor = (
  credentials: RemoteD1Credentials
): SqlExecutor =>
  makeSqlExecutor({
    query: async (sql, params) => {
      const inlined =
        params !== undefined && params.length > 0
          ? inlineSqlParams(sql, params, "sqlite")
          : sql;
      const result = await queryRemoteD1Http(credentials, { sql: inlined });
      return (result.result[0]?.results ?? []) as Array<
        Record<string, unknown>
      >;
    },
    batch: async (statements) => {
      await queryRemoteD1Http(credentials, {
        batch: statements.map((sql) => ({ sql })),
      });
    },
  });

const makeD1BindingMigrationExecutor = (d1: D1Database): SqlExecutor =>
  makeSqlExecutor({
    query: async (sql, params) => {
      const statement =
        params !== undefined && params.length > 0
          ? d1.prepare(sql).bind(...params)
          : d1.prepare(sql);
      const result = await statement.all();
      return (result.results ?? []) as Array<Record<string, unknown>>;
    },
    batch: async (statements) => {
      await d1.batch(statements.map((sql) => d1.prepare(sql)));
    },
  });

const hashedMigrationCount = async (executor: SqlExecutor): Promise<number> => {
  const run = await Effect.runPromise(
    runMigrations({
      input: { dir: D1_MIGRATIONS_DIR },
      stamped: {},
      withExecutor: (apply) => apply(executor),
    }).pipe(Effect.provide(BunServices))
  );
  return Object.keys(run.hashes).length;
};

const applyMigrationsOnLocalBinding = async (): Promise<void> => {
  const proxy = await openLocalAlchemyD1();
  try {
    const d1 = proxy.env.DB;
    if (!d1) {
      throw new Error("D1 binding DB missing from Alchemy local simulator");
    }
    const hashed = await hashedMigrationCount(
      makeD1BindingMigrationExecutor(d1)
    );
    console.log(`Alchemy local D1 migrations hashed ${String(hashed)} files`);
  } finally {
    await proxy.dispose();
  }
};

export const applyLocalAlchemyD1Migrations = async (): Promise<void> => {
  requireVarlock("db:migrate");
  ensureLocalAlchemyProfile();
  if (existsSync(alchemyDatabaseStatePath())) {
    console.log(
      `Applying Alchemy local D1 migrations (persist ${ALCHEMY_LOCAL_PERSIST_DIR}/d1)`
    );
    await applyMigrationsOnLocalBinding();
    console.log(`Alchemy local D1 ready: ${readLocalAlchemyDatabaseId()}`);
    return;
  }

  const stack = (await import("../alchemy.run.ts")).default;
  await Effect.runPromise(
    Effect.gen(function* () {
      const planned = yield* Alchemist.plan({
        stack,
        stage: ALCHEMY_STAGE,
        operation: "deploy",
        dev: true,
        adopt: false,
        updateStateStore: false,
        include: ["Database"],
      });
      const live = planned.resources.filter(
        (resource) => resource.providerMode === "live"
      );
      if (live.length > 0) {
        return yield* Effect.fail(
          new Error(
            `db:migrate refused a live provider: ${live
              .map((resource) => resource.logicalId)
              .join(", ")}`
          )
        );
      }
      const database = planned.resources.find(
        (resource) => resource.logicalId === "Database"
      );
      if (database === undefined) {
        return yield* Effect.fail(
          new Error("db:migrate planned no Database resource.")
        );
      }
      console.log(
        `Creating Alchemy local D1 (${database.action}, persist ${ALCHEMY_LOCAL_PERSIST_DIR}/d1)`
      );
      yield* Alchemist.apply(planned);
    }).pipe(Effect.provide(Alchemist.layer()), Effect.scoped)
  );
  console.log(`Alchemy local D1 ready: ${readLocalAlchemyDatabaseId()}`);
};

export const applyRemoteAlchemyD1Migrations = async (): Promise<void> => {
  requireVarlock("db:migrate:remote");
  const credentials = readRemoteD1Credentials();
  console.log(
    `Applying Alchemy migrations over D1 HTTP to ${credentials.databaseId}`
  );
  const hashed = await hashedMigrationCount(
    makeHttpMigrationExecutor(credentials)
  );
  console.log(`Remote D1 migrations hashed ${String(hashed)} files`);
};
