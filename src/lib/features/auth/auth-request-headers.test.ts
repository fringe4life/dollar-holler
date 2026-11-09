import { describe, expect, it } from "bun:test";
import { authApiHeaders } from "./auth-request-headers.ts";

describe("authApiHeaders", () => {
  it("keeps cookie and origin, drops the Kit form content-type", () => {
    const headers = authApiHeaders(
      new Request(
        "http://localhost:5173/signup?/remote=1kgutvo/signup/%22s1%22",
        {
          headers: {
            cookie: "theme=dark",
            origin: "http://localhost:5173",
            "content-type": "application/x-www-form-urlencoded",
            "user-agent": "test",
          },
          method: "POST",
        }
      )
    );

    expect(headers.get("cookie")).toBe("theme=dark");
    expect(headers.get("origin")).toBe("http://localhost:5173");
    expect(headers.get("user-agent")).toBe("test");
    expect(headers.get("content-type")).toBe("application/json");
  });

  it("uses the referer origin when Origin is missing", () => {
    const headers = authApiHeaders(
      new Request("http://localhost:5173/signup", {
        headers: {
          referer: "http://localhost:5173/signup",
        },
        method: "POST",
      })
    );

    expect(headers.get("origin")).toBe("http://localhost:5173");
  });
});
