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

const { Auth, getAuth, loopbackTwinOrigin } = await import("./auth.server.ts");

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
    expect(first.options.allowedHosts).toContain("127.0.0.1:*");
    expect(first.options.trustedOrigins).toContain("http://127.0.0.1:5173");
    expect(first.options.trustedOrigins).toContain("https://dolla-holla.org");
  });

  it("pairs localhost and 127.0.0.1 origins", () => {
    expect(loopbackTwinOrigin("http://localhost:5173")).toBe(
      "http://127.0.0.1:5173"
    );
    expect(loopbackTwinOrigin("http://127.0.0.1:5173")).toBe(
      "http://localhost:5173"
    );
    expect(loopbackTwinOrigin("https://dolla-holla.org")).toBeUndefined();
  });
});
