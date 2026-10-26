import { describe, expect, it } from "bun:test";
import { andFilters, withUserAndSearch } from "./base-filter";

describe("andFilters", () => {
  it("returns {} when every part is omitted", () => {
    expect(andFilters()).toEqual({});
    expect(andFilters(undefined, undefined)).toEqual({});
  });

  it("returns the sole defined part without wrapping AND", () => {
    const only = { userId: { eq: "u1" } };
    expect(andFilters(undefined, only, undefined)).toEqual(only);
  });

  it("builds a non-empty AND for two or more parts", () => {
    const a = { userId: { eq: "u1" } };
    const b = { clientId: { eq: "c1" } };
    const c = { OR: [{ name: { like: "%x%" } }] };
    expect(andFilters(a, b, c)).toEqual({ AND: [a, b, c] });
  });

  it("skips undefined so optional search never yields AND: []", () => {
    const a = { userId: { eq: "u1" } };
    expect(andFilters(a, undefined)).toEqual(a);
  });
});

describe("withUserAndSearch", () => {
  it("omits search when undefined (no EmptyFilter / empty OR)", () => {
    expect(withUserAndSearch("u1", undefined)).toEqual({
      userId: { eq: "u1" },
    });
  });

  it("ANDs a non-empty search clause", () => {
    const sw = { OR: [{ name: { like: "%ada%" } }] };
    expect(withUserAndSearch("u1", sw)).toEqual({
      AND: [{ userId: { eq: "u1" } }, sw],
    });
  });
});
