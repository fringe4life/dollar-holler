import type { CursorId, Maybe } from "#lib/types";
import { pickDefined } from "#lib/utils/strip-nullish-entries";
import { DEFAULT_LIMIT, LIMITS, type ListLimit } from "../constants";
import type {
  ListDirection,
  NormalizeListQueryResult,
  PaginationSearchParams,
  PaginationSearchParamsRaw,
} from "../types";
import { tryParseCursorId } from "./parse-cursor-id";

/**
 * @description Parses a limit parameter from a string.
 * @param raw - The raw limit parameter.
 * @returns The parsed limit parameter.
 */
const parseLimit = (raw: Maybe<string>): ListLimit => parseLimitParam(raw);

/**
 * @description Parses a direction parameter from a string.
 * @param raw - The raw direction parameter.
 * @returns The parsed direction parameter.
 */
const parseDirection = (raw: Maybe<string>): ListDirection =>
  raw === "backward" ? "backward" : "forward";

/** Backward without cursor: first page (same as forward, no cursor). */
const effectiveDirection = (
  direction: ListDirection | undefined,
  cursor: CursorId | undefined
): ListDirection => {
  const resolved = direction ?? "forward";
  return resolved === "backward" && !cursor ? "forward" : resolved;
};

const isListLimit = (limit: number): limit is ListLimit =>
  (LIMITS as readonly number[]).includes(limit);

const coerceLimit = (limit?: number): ListLimit =>
  limit !== undefined && isListLimit(limit) ? limit : DEFAULT_LIMIT;

/**
 * Shared list-query normalization for remotes and URL search params.
 * Invalid UUIDv7 `cursor` values are dropped (first-page semantics); sets `listCursorWasNormalized`.
 */
const normalizeListQuery = (raw: {
  q?: string;
  cursor?: string;
  direction?: string;
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

  return {
    listCursorWasNormalized,
    // ArkType `"cursor?"` / `"q?"` reject present-but-undefined keys.
    normalized: pickDefined({
      cursor,
      direction: effectiveDirection(direction, cursor),
      limit,
      q,
    }) as PaginationSearchParams,
  };
};

/** Read-only search params (incl. SvelteKit visible list URL searchParams). */
type SearchParamsReadable = Pick<URLSearchParams, "get">;

export const normalizeListQueryFromUrl = (url: {
  searchParams: SearchParamsReadable;
}): NormalizeListQueryResult =>
  normalizeListQuery(parseSearchParamsToRaw(url.searchParams));

const firstParam = (
  searchParams: SearchParamsReadable,
  key: string
): string | undefined => {
  const v = searchParams.get(key);
  return v === null || v === "" ? undefined : v;
};

/** First `cursor` wins (matches `URLSearchParams.get`). */
const parseSearchParamsToRaw = (
  searchParams: SearchParamsReadable
): PaginationSearchParamsRaw => ({
  cursor: firstParam(searchParams, "cursor"),
  direction: firstParam(searchParams, "direction"),
  limit: firstParam(searchParams, "limit"),
  q: firstParam(searchParams, "q"),
});

/**
 * @description Parses a limit parameter from a string.
 * @param raw - The raw limit parameter.
 * @returns The parsed limit parameter.
 */
export const parseLimitParam = (raw: Maybe<string>): ListLimit => {
  if (!raw) {
    return DEFAULT_LIMIT;
  }
  const n = Number(raw);
  return isListLimit(n) ? n : DEFAULT_LIMIT;
};

/**
 * @description Builds a normalized query from URL/search args (defaults match remotes).
 * @param q - The query parameter.
 * @param options - The options parameter.
 * @returns The normalized query.
 */
export const toNormalizedListQuery = (
  q: Maybe<string>,
  options?: Partial<PaginationSearchParams>
): PaginationSearchParams =>
  pickDefined({
    cursor: options?.cursor,
    direction: effectiveDirection(options?.direction, options?.cursor),
    limit: coerceLimit(options?.limit),
    q: q?.trim() || undefined,
  }) as PaginationSearchParams;
