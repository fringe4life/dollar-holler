import { describe, expect, it } from "bun:test";
import { APP_NAME, EXISTING_D1_DATABASE_ID } from "../alchemy.run.ts";
import {
  alchemyDatabaseStatePath,
  ALCHEMY_LOCAL_PERSIST_DIR,
  assertLocalSimulatorD1Id,
  assertRemoteD1DatabaseId,
  migrationSqlStatements,
  parseD1RawResults,
  serializeD1HttpQueryBody,
} from "./alchemy-d1.ts";

describe("alchemy local D1", () => {
  it("rejects the existing live UUID as a local simulator id", () => {
    expect(() => assertLocalSimulatorD1Id(EXISTING_D1_DATABASE_ID)).toThrow(
      /Alchemy simulator/
    );
  });

  it("refuses the live UUID for remote migrate and seed", () => {
    expect(() => assertRemoteD1DatabaseId(EXISTING_D1_DATABASE_ID)).toThrow(
      /Refusing D1 id of live database/
    );
  });

  it("keeps simulator persist under .alchemy/local", () => {
    expect(APP_NAME).toBe("dollar-holler");
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
