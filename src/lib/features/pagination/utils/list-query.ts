import type { CursorId } from "#lib/schemas/cursor-id.ts";
import { DEFAULT_LIMIT, LIMITS, type ListLimit } from "../constants";
import type { ListDirection, PaginationSearchParams } from "../types";
import { tryParseCursorId } from "./parse-cursor-id";
import {
  buildListSearchString,
  LIST_QUERY_KEYS,
  type ListSearchParams,
  type ListPage,
  visibleListUrl,
} from "./url";

const isListKey = (key: string): boolean => LIST_QUERY_KEYS.has(key);

const isListLimit = (limit: number): limit is ListLimit => {
  for (const allowed of LIMITS) {
    if (allowed === limit) {
      return true;
    }
  }
  return false;
};

/** First value wins, matching `URLSearchParams.get`. Blank is absent. */
const firstParam = (
  searchParams: ListSearchParams,
  key: string
): string | undefined => {
  const value = searchParams.get(key);
  return value === null || value === "" ? undefined : value;
};

/**
 * Whole-string integer in the allow-list. `25px`, `25.5`, and `25.0` fall back.
 * The default is omitted from the canonical URL.
 */
/** Whole-string integer only — rejects `25px`, `25.5`, and `25.0`. */
const isExactIntegerString = (raw: string, value: number): boolean =>
  Number.isInteger(value) && String(value) === raw;

export const parseLimitParam = (raw: string | undefined): ListLimit => {
  if (raw === undefined) {
    return DEFAULT_LIMIT;
  }
  const limit = Number(raw);
  if (!(isExactIntegerString(raw, limit) && isListLimit(limit))) {
    return DEFAULT_LIMIT;
  }
  return limit;
};

const parseDirection = (raw: string | undefined): ListDirection =>
  raw === "backward" ? "backward" : "forward";

/** Backward without a usable cursor is the first page. */
const effectiveDirection = (
  direction: ListDirection,
  cursor: CursorId | undefined
): ListDirection =>
  direction === "backward" && cursor === undefined ? "forward" : direction;

const parseQuery = (raw: string | undefined): string | undefined => {
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
};

const parseCursor = (raw: string | undefined): CursorId | undefined => {
  if (raw === undefined) {
    return undefined;
  }
  const parsed = tryParseCursorId(raw);
  return parsed === false ? undefined : parsed;
};

const toListQuery = (raw: {
  cursor?: string;
  direction?: string;
  limit?: string | number;
  q?: string;
}): PaginationSearchParams => {
  const q = parseQuery(raw.q);
  const cursor = parseCursor(raw.cursor);
  const direction = effectiveDirection(parseDirection(raw.direction), cursor);
  const limit = parseLimitParam(
    raw.limit === undefined ? undefined : String(raw.limit)
  );
  return {
    ...(cursor === undefined ? {} : { cursor }),
    direction,
    limit,
    ...(q === undefined ? {} : { q }),
  };
};

export const readListQuery = (page: ListPage): PaginationSearchParams => {
  const { searchParams } = visibleListUrl(page);
  return toListQuery({
    cursor: firstParam(searchParams, "cursor"),
    direction: firstParam(searchParams, "direction"),
    limit: firstParam(searchParams, "limit"),
    q: firstParam(searchParams, "q"),
  });
};

export type ListNav =
  | { cursor: CursorId; type: "backward" }
  | { cursor: CursorId; type: "forward" }
  | { limit: ListLimit; type: "limit" }
  | { q: string; type: "search" };

/** Search and limit changes clear the cursor. Paging keeps `q` and `limit`. */
export const applyListNav = (
  current: PaginationSearchParams,
  nav: ListNav
): PaginationSearchParams => {
  switch (nav.type) {
    case "search":
      return toListQuery({ limit: current.limit, q: nav.q });
    case "forward":
    case "backward":
      return toListQuery({
        cursor: nav.cursor,
        direction: nav.type,
        limit: current.limit,
        q: current.q,
      });
    case "limit":
      return toListQuery({ limit: nav.limit, q: current.q });
    default: {
      const unreachable: never = nav;
      return unreachable;
    }
  }
};

const expectedListPairs = (
  query: PaginationSearchParams
): [string, string][] => {
  const pairs: [string, string][] = [];
  if (query.q) {
    pairs.push(["q", query.q]);
  }
  if (query.cursor) {
    pairs.push(["cursor", query.cursor]);
  }
  if (query.direction === "backward") {
    pairs.push(["direction", "backward"]);
  }
  if (query.limit !== DEFAULT_LIMIT) {
    pairs.push(["limit", String(query.limit)]);
  }
  return pairs;
};

/** `null` when a list key is repeated. Order is appearance order. */
const actualListPairs = (
  searchParams: ListSearchParams
): [string, string][] | null => {
  const pairs: [string, string][] = [];
  const seen = new Set<string>();
  for (const [key, value] of searchParams.entries()) {
    if (!isListKey(key)) {
      continue;
    }
    if (seen.has(key)) {
      return null;
    }
    seen.add(key);
    pairs.push([key, value]);
  }
  return pairs;
};

const listKeysAreCanonical = (
  searchParams: ListSearchParams,
  query: PaginationSearchParams
): boolean => {
  const actual = actualListPairs(searchParams);
  if (actual === null) {
    return false;
  }
  const expected = expectedListPairs(query);
  if (actual.length !== expected.length) {
    return false;
  }
  return actual.every(
    (pair, index) =>
      pair[0] === expected[index]?.[0] && pair[1] === expected[index]?.[1]
  );
};

/**
 * Search suffix to `replace` onto, or `null` when the list keys already match
 * the canonical query. `""` means the list keys should be removed.
 * Keys other than `q`, `cursor`, `direction`, and `limit` are kept.
 */
export const nextCanonicalSearch = (url: {
  searchParams: ListSearchParams;
}): string | null => {
  const query = toListQuery({
    cursor: firstParam(url.searchParams, "cursor"),
    direction: firstParam(url.searchParams, "direction"),
    limit: firstParam(url.searchParams, "limit"),
    q: firstParam(url.searchParams, "q"),
  });
  if (listKeysAreCanonical(url.searchParams, query)) {
    return null;
  }
  return buildListSearchString(query, url.searchParams);
};
