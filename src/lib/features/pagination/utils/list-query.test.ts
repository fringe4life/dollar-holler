import { describe, expect, it } from "bun:test";
import type { CursorId } from "#lib/schemas/cursor-id.ts";
import {
  applyListNav,
  nextCanonicalSearch,
  parseLimitParam,
  readListQuery,
} from "./list-query";
import { tryParseCursorId } from "./parse-cursor-id";
import type { ListPage } from "./url";

const parsedCursor = tryParseCursorId("018f0000-0000-7000-8000-000000000001");
if (parsedCursor === false) {
  throw new Error("fixture cursor is not a UUIDv7");
}
const CURSOR: CursorId = parsedCursor;

const pageFor = (search: string): ListPage => ({
  shallow: null,
  url: new URL(`https://dollar-holler.test/invoices${search}`),
});

describe("readListQuery", () => {
  it("drops an invalid cursor and treats backward with no cursor as forward", () => {
    const query = readListQuery(
      pageFor("?cursor=not-a-uuid&direction=backward&limit=999")
    );
    expect(query).toEqual({ direction: "forward", limit: 10 });
  });

  it("trims q and keeps a valid cursor page", () => {
    const query = readListQuery(
      pageFor(`?q=%20ada%20&cursor=${CURSOR}&direction=backward&limit=25`)
    );
    expect(query).toEqual({
      cursor: CURSOR,
      direction: "backward",
      limit: 25,
      q: "ada",
    });
  });

  it("uses the first duplicate", () => {
    const query = readListQuery(pageFor("?limit=50&limit=25"));
    expect(query.limit).toBe(50);
  });

  it("reads the shallow URL", () => {
    const query = readListQuery({
      shallow: { url: new URL("https://dollar-holler.test/invoices?q=ada") },
      url: new URL("https://dollar-holler.test/invoices"),
    });
    expect(query.q).toBe("ada");
  });
});

describe("parseLimitParam", () => {
  it("accepts only the exact allow-list", () => {
    expect(parseLimitParam("10")).toBe(10);
    expect(parseLimitParam("25")).toBe(25);
    expect(parseLimitParam("25px")).toBe(10);
    expect(parseLimitParam("25.5")).toBe(10);
    expect(parseLimitParam("25.0")).toBe(10);
    expect(parseLimitParam(undefined)).toBe(10);
  });
});

describe("applyListNav", () => {
  const current = readListQuery(
    pageFor(`?q=ada&cursor=${CURSOR}&direction=backward&limit=25`)
  );

  it("search keeps limit and clears the cursor", () => {
    expect(applyListNav(current, { q: "  bey  ", type: "search" })).toEqual({
      direction: "forward",
      limit: 25,
      q: "bey",
    });
  });

  it("forward and backward keep q and limit", () => {
    expect(applyListNav(current, { cursor: CURSOR, type: "forward" })).toEqual({
      cursor: CURSOR,
      direction: "forward",
      limit: 25,
      q: "ada",
    });
  });

  it("limit clears the cursor", () => {
    expect(applyListNav(current, { limit: 50, type: "limit" })).toEqual({
      direction: "forward",
      limit: 50,
      q: "ada",
    });
  });
});

describe("nextCanonicalSearch", () => {
  it("leaves a canonical query alone, including plus-encoded spaces", () => {
    expect(nextCanonicalSearch(pageFor("?q=hello+world&limit=25").url)).toBe(
      null
    );
    expect(
      nextCanonicalSearch(
        pageFor(`?q=ada&cursor=${CURSOR}&direction=backward`).url
      )
    ).toBe(null);
  });

  it("drops invalid values and explicit defaults", () => {
    expect(
      nextCanonicalSearch(pageFor("?limit=999&direction=forward&q=ada").url)
    ).toBe("?q=ada");
    expect(nextCanonicalSearch(pageFor("?limit=10").url)).toBe("");
    expect(nextCanonicalSearch(pageFor("?cursor=not-a-uuid").url)).toBe("");
    expect(nextCanonicalSearch(pageFor("?direction=backward").url)).toBe("");
  });

  it("rewrites trimmed q, key order, and keeps unknown keys", () => {
    expect(nextCanonicalSearch(pageFor("?q=%20ada%20").url)).toBe("?q=ada");
    expect(nextCanonicalSearch(pageFor("?limit=25&q=ada").url)).toBe(
      "?q=ada&limit=25"
    );
    expect(
      nextCanonicalSearch(pageFor("?utm=newsletter&limit=999&ref=a").url)
    ).toBe("?utm=newsletter&ref=a");
    expect(nextCanonicalSearch(pageFor("?q=ada&utm=1").url)).toBe(null);
  });

  it("collapses duplicate list keys to the first value", () => {
    expect(nextCanonicalSearch(pageFor("?q=ada&q=bey").url)).toBe("?q=ada");
  });

  it("encodes spaces with percent encoding on write", () => {
    expect(nextCanonicalSearch(pageFor("?q=%20hello%20world%20").url)).toBe(
      "?q=hello%20world"
    );
  });
});
