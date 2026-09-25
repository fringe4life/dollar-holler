import { mock } from "bun:test";

mock.module("$app/env", () => ({
  browser: true,
  building: false,
  dev: false,
}));
