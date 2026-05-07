import type { CursorId, Maybe } from "$lib/types";
import { DEFAULT_LIMIT, LIMITS } from "../constants";
import type {
  ListDirection,
  NormalizeListQueryResult,
  PaginationSearchParams,
} from "../types";
import { tryParseCursorId } from "./parse-cursor-id";

/**
 * @description Parses a limit parameter from a string.
 * @param raw - The raw limit parameter.
 * @returns The parsed limit parameter.
 */
const parseLimit = (raw: Maybe<string>): number => parseLimitParam(raw);

/**
 * @description Parses a direction parameter from a string.
 * @param raw - The raw direction parameter.
 * @returns The parsed direction parameter.
 */
const parseDirection = (raw: Maybe<string>): ListDirection =>
  raw === "backward" ? "backward" : "forward";

/**
 * Shared list-query normalization for SSR, Elysia GET handlers, and client.
 * Invalid UUIDv7 `cursor` values are dropped (first-page semantics); sets `listCursorWasNormalized`.
 */
export const normalizeListQuery = (raw: {
  q?: string;
  cursor?: string;
  direction?: string;
  /** Elysia/ArkType wire may narrow `limit` to numeric literals. */
  limit?: string | number;
}): NormalizeListQueryResult => {
  let listCursorWasNormalized = false;
  const q = raw.q?.trim() || undefined;

  let cursor: CursorId | undefined;
  if (raw.cursor !== undefined && raw.cursor !== "") {
    const parsed = tryParseCursorId(String(raw.cursor));
    if (parsed === false) {
      listCursorWasNormalized = true;
    } else {
      cursor = parsed;
    }
  }

  const direction = parseDirection(
    raw.direction === undefined ? undefined : String(raw.direction)
  );
  const limitWire =
    raw.limit === undefined || raw.limit === "" ? undefined : String(raw.limit);
  const limit = parseLimit(limitWire);

  /** Backward without cursor: first page (same as forward, no cursor). */
  const effectiveDirection: ListDirection =
    direction === "backward" && !cursor ? "forward" : direction;

  return {
    normalized: {
      q,
      cursor,
      direction: effectiveDirection,
      limit,
    },
    listCursorWasNormalized,
  };
};

export const normalizeListQueryFromUrl = (url: URL): NormalizeListQueryResult =>
  normalizeListQuery(parseSearchParamsToRaw(url.searchParams));

const firstParam = (
  searchParams: URLSearchParams,
  key: string
): string | undefined => {
  const v = searchParams.get(key);
  return v === null || v === "" ? undefined : v;
};

/** First `cursor` wins (matches `URLSearchParams.get`). */
const parseSearchParamsToRaw = (
  searchParams: URLSearchParams
): {
  q?: string;
  cursor?: string;
  direction?: string;
  limit?: string;
} => ({
  q: firstParam(searchParams, "q"),
  cursor: firstParam(searchParams, "cursor"),
  direction: firstParam(searchParams, "direction"),
  limit: firstParam(searchParams, "limit"),
});

/**
 * @description Parses a limit parameter from a string.
 * @param raw - The raw limit parameter.
 * @returns The parsed limit parameter.
 */
export const parseLimitParam = (raw: Maybe<string>): number => {
  if (!raw) {
    return DEFAULT_LIMIT;
  }
  const n = Number(raw);
  return LIMITS.includes(
    // @ts-expect-error
    n
  )
    ? n
    : DEFAULT_LIMIT;
};

/**
 * @description Builds a normalized query from store/API args (defaults match URL + server).
 * @param q - The query parameter.
 * @param options - The options parameter.
 * @returns The normalized query.
 */
export const toNormalizedListQuery = (
  q: Maybe<string>,
  options?: {
    cursor?: CursorId;
    direction?: ListDirection;
    limit?: number;
  }
): PaginationSearchParams => {
  const limit =
    options?.limit !== undefined &&
    LIMITS.includes(options.limit as (typeof LIMITS)[number])
      ? options.limit
      : DEFAULT_LIMIT;
  let direction: ListDirection = options?.direction ?? "forward";
  if (direction === "backward" && !options?.cursor) {
    direction = "forward";
  }
  return {
    q: q?.trim() || undefined,
    cursor: options?.cursor,
    direction,
    limit,
  };
};
