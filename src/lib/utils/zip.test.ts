import { describe, expect, it } from "bun:test";
import { safeParse } from "valibot";
import { ZIP_INVALID_MESSAGE, optionalZipSchema, zipSchema } from "./zip";

describe("zipSchema", () => {
  it("accepts 5-digit and ZIP+4", () => {
    expect(safeParse(zipSchema, "02101").success).toBe(true);
    expect(safeParse(zipSchema, "12345-6789").success).toBe(true);
  });

  it("rejects letters, empty, and truncated codes", () => {
    expect(safeParse(zipSchema, "hello").success).toBe(false);
    expect(safeParse(zipSchema, "").success).toBe(false);
    expect(safeParse(zipSchema, "1234").success).toBe(false);
    expect(safeParse(zipSchema, "hello")?.issues?.[0]?.message).toBe(
      ZIP_INVALID_MESSAGE
    );
  });
});

describe("optionalZipSchema", () => {
  it("allows omitted or empty", () => {
    expect(safeParse(optionalZipSchema, undefined).success).toBe(true);
    expect(safeParse(optionalZipSchema, "").success).toBe(true);
  });

  it("rejects invalid when present", () => {
    expect(safeParse(optionalZipSchema, "hello").success).toBe(false);
  });
});
