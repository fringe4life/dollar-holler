import { mock } from "bun:test";

// Unit tests always use committed `.env.test` dummies, even if the shell
// inherited development or production. Set this before `varlock/auto-load`.
process.env.VARLOCK_ENV = "test";

mock.module("$app/env", () => ({
  browser: true,
  building: false,
  dev: false,
}));
