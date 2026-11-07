import { describe, expect, it, mock } from "bun:test";

mock.module("$app/server", () => ({
  getRequestEvent: () => ({
    platform: {
      env: {
        DB: {
          prepare: () => {
            throw new Error("auth unit test does not query D1");
          },
        },
      },
    },
  }),
}));

const { Auth, getAuth } = await import("./auth.server.ts");

describe("Auth service", () => {
  it("caches one Better Auth instance and unwraps the secret", () => {
    const first = getAuth();
    const second = getAuth();

    expect(first).toBe(second);
    expect(Auth.key).toBe("dollar-holler/Auth");
    expect(first.options.baseURL).toBe("http://localhost:5173");
    expect(typeof first.options.secret).toBe("string");
    expect(first.options.secret).not.toContain("Redacted");
    expect(first.options.basePath).toBe("/api/auth");
  });
});
