import { describe, expect, it } from "bun:test";
import { APP_NAME, EXISTING_D1_DATABASE_ID } from "../alchemy.run.ts";
import {
  alchemyDatabaseStatePath,
  ALCHEMY_LOCAL_PERSIST_DIR,
  assertLocalSimulatorD1Id,
} from "./alchemy-d1.ts";

describe("alchemy local D1", () => {
  it("rejects the existing live UUID as a local simulator id", () => {
    expect(() => assertLocalSimulatorD1Id(EXISTING_D1_DATABASE_ID)).toThrow(
      /Alchemy simulator/
    );
  });

  it("keeps simulator persist under .alchemy/local", () => {
    expect(APP_NAME).toBe("dollar-holler");
    expect(ALCHEMY_LOCAL_PERSIST_DIR.endsWith(".alchemy/local")).toBe(true);
    expect(alchemyDatabaseStatePath()).toContain(APP_NAME);
    expect(alchemyDatabaseStatePath()).toContain("Database.json");
  });
});
