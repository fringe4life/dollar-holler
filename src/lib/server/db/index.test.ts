import { describe, expect, it, mock } from "bun:test";

const platformBinding = {
  prepare: () => {
    throw new Error("unit test does not query D1");
  },
};

mock.module("$app/server", () => ({
  getRequestEvent: () => ({
    platform: { env: { DB: platformBinding } },
  }),
}));

const { getDb } = await import("./index.ts");

describe("getDb", () => {
  it("uses platform.env.DB", () => {
    expect(getDb()).toBeDefined();
  });
});
