import { mock } from "bun:test";

// Unit tests use committed `.env.test` dummies. Set this before `varlock/auto-load`.
process.env.VARLOCK_ENV ??= "test";

mock.module("$app/env", () => ({
  browser: true,
  building: false,
  dev: false,
}));
