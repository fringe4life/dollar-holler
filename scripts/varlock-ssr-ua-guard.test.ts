import { describe, expect, it } from "bun:test";
import {
  VARLOCK_ALCHEMY_INIT_GUARD,
  varlockSsrUaGuard,
} from "./varlock-ssr-ua-guard.ts";

const plugin = varlockSsrUaGuard();
const transform = plugin.transform;
if (transform === undefined || typeof transform !== "function") {
  throw new Error("varlock-ssr-ua-guard is missing transform");
}

const apply = (code: string, id = "\0varlock-ssr-init"): string => {
  const result = transform.call({} as never, code, id);
  if (result === undefined || typeof result === "string") {
    return result ?? code;
  }
  return result.code;
};

const INIT_ONLY = `import { initVarlockRuntime } from 'varlock/init';
initVarlockRuntime();
`;

describe("varlock SSR init (Alchemy)", () => {
  it("does not transform unrelated modules", () => {
    expect(apply(INIT_ONLY, "src/hooks.server.ts")).toBe(INIT_ONLY);
  });

  it("skips initVarlockRuntime when the Worker has no env blob", () => {
    const code = apply(INIT_ONLY);
    expect(code).toContain(VARLOCK_ALCHEMY_INIT_GUARD);
    expect(code.includes("\ninitVarlockRuntime();")).toBe(false);
  });

  it("is idempotent", () => {
    const once = apply(INIT_ONLY);
    expect(apply(once)).toBe(once);
  });
});
