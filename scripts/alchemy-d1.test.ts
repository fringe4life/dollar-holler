import { describe, expect, it } from "bun:test";
import {
  APP_NAME,
  D1_NAME,
  LIVE_PRODUCTION_D1_UUID,
  PUBLIC_SITE_HOST,
  PUBLIC_SITE_URL,
} from "../alchemy.run.ts";
import * as alchemyRun from "../alchemy.run.ts";
import {
  alchemyDatabaseStatePath,
  ALCHEMY_LOCAL_PERSIST_DIR,
  alchemyDeployArgvRefusesAdopt,
  alchemyProfileOnlyEnv,
  assertLocalSimulatorD1Id,
  assertRemoteD1DatabaseId,
  migrationSqlStatements,
  parseD1RawResults,
  parseRemoteD1Credentials,
  serializeD1HttpQueryBody,
} from "./alchemy-d1.ts";

describe("alchemy local D1", () => {
  it("rejects the existing live UUID as a local simulator id", () => {
    expect(() => assertLocalSimulatorD1Id(LIVE_PRODUCTION_D1_UUID)).toThrow(
      /Alchemy simulator/
    );
  });

  it("refuses the live UUID for remote migrate and seed", () => {
    expect(() => assertRemoteD1DatabaseId(LIVE_PRODUCTION_D1_UUID)).toThrow(
      /Refusing D1 id of leftover database/
    );
    expect(() =>
      parseRemoteD1Credentials({
        accountId: "acct",
        databaseId: LIVE_PRODUCTION_D1_UUID,
        apiToken: "tok",
      })
    ).toThrow(/Refusing D1 id of leftover database/);
  });

  it("drops D1 HTTP keys so Alchemy uses the CLI profile", () => {
    const env = alchemyProfileOnlyEnv({
      ...process.env,
      CLOUDFLARE_API_TOKEN: "d1-only",
      CLOUDFLARE_ACCOUNT_ID: "acct",
      CLOUDFLARE_D1_DATABASE_ID: "db",
      BETTER_AUTH_SECRET: "keep",
      __VARLOCK_RUN: "1",
    });
    expect(env.CLOUDFLARE_API_TOKEN).toBeUndefined();
    expect(env.CLOUDFLARE_ACCOUNT_ID).toBeUndefined();
    expect(env.CLOUDFLARE_D1_DATABASE_ID).toBeUndefined();
    expect(env.BETTER_AUTH_SECRET).toBe("keep");
    expect(env.__VARLOCK_RUN).toBe("1");
  });

  it("refuses adopt argv on alchemy:deploy", () => {
    expect(alchemyDeployArgvRefusesAdopt(["--stage", "dev"])).toBe(false);
    expect(alchemyDeployArgvRefusesAdopt(["--adopt"])).toBe(true);
    expect(alchemyDeployArgvRefusesAdopt(["adopt"])).toBe(true);
  });

  it("requires the three Varlock schema keys for remote D1", () => {
    expect(() =>
      parseRemoteD1Credentials({
        accountId: "",
        databaseId: "",
        apiToken: "",
      })
    ).toThrow(
      /CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_API_TOKEN/
    );
  });

  it("keeps simulator persist under .alchemy/local", () => {
    expect(APP_NAME).toBe("dollar-holler");
    expect(D1_NAME).toBe("dolla-holla");
    expect(PUBLIC_SITE_HOST).toBe("dolla-holla.org");
    expect(PUBLIC_SITE_URL).toBe("https://dolla-holla.org");
    expect("DollaHolla" in alchemyRun).toBe(false);
    expect("DOLLA_HOLLA_LOGICAL_ID" in alchemyRun).toBe(false);
    expect(ALCHEMY_LOCAL_PERSIST_DIR.endsWith(".alchemy/local")).toBe(true);
    expect(alchemyDatabaseStatePath()).toContain(APP_NAME);
    expect(alchemyDatabaseStatePath()).toContain("Database.json");
  });

  it("keeps multi-line CREATE TABLE as one migration statement", () => {
    const sql = `CREATE TABLE \`account\` (\n\t\`id\` text PRIMARY KEY\n);`;
    expect(migrationSqlStatements([sql, "  "])).toEqual([sql]);
  });

  it("serializes D1 HTTP batch as an object, not a bare array", () => {
    const body = { batch: [{ sql: "SELECT 1" }] };
    expect(JSON.parse(serializeD1HttpQueryBody(body))).toEqual(body);
  });

  it("parses D1 /raw packed rows so duplicate column names stay positional", () => {
    expect(
      parseD1RawResults({
        columns: ["id", "id"],
        rows: [
          [1, 2],
          [3, 4],
        ],
      })
    ).toEqual({
      columns: ["id", "id"],
      rows: [
        [1, 2],
        [3, 4],
      ],
    });
  });
});
