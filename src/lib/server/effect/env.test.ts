import { describe, expect, it } from "bun:test";
import { Effect, Redacted } from "effect";
import { Env, loadEnv, runtime } from "./env.ts";

describe("loadEnv", () => {
  it("loads the public test URL and keeps secrets redacted", async () => {
    // `[test] preload` runs `varlock/auto-load` after `VARLOCK_ENV=test`,
    // so `.env.test` supplies dummy literals and Bitwarden is not called.
    expect(process.env.VARLOCK_ENV).toBe("test");

    const env = await loadEnv();
    const viaService = await runtime.runPromise(
      Effect.gen(function* () {
        return yield* Env;
      })
    );

    expect(env.PUBLIC_BASE_URL).toBe("http://localhost:5173");
    expect(viaService.PUBLIC_BASE_URL).toBe(env.PUBLIC_BASE_URL);
    expect(Redacted.isRedacted(env.BETTER_AUTH_SECRET)).toBe(true);
  });
});
